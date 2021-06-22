from flask import Flask, request, Response
from werkzeug.utils import secure_filename
import uuid
import json
from flask_sqlalchemy import SQLAlchemy
from qiniu import Auth, put_file
import config
import text_exchange

import librosa
import tensorflow as tf
import loupe_keras as lpk
import numpy as np
import wave
import os

import torch
import torch.nn as nn
from torch.nn import functional as F
from torch.autograd import Variable

tf.compat.v1.enable_eager_execution()


# tf.enable_eager_execution()

def wav2vlad(wave_data, sr):
    global cluster_size
    signal = wave_data
    melspec = librosa.feature.melspectrogram(signal, n_mels=80, sr=sr).astype(np.float32).T
    feature_size = melspec.shape[1]
    max_samples = melspec.shape[0]
    output_dim = cluster_size * 16
    feat = lpk.NetVLAD(feature_size=feature_size, max_samples=max_samples, \
                       cluster_size=cluster_size, output_dim=output_dim) \
        (tf.convert_to_tensor(melspec))
    with tf.Session() as sess:
        init = tf.global_variables_initializer()
        sess.run(init)
        r = feat.numpy()
    return r


class AudioBiLSTM(nn.Module):
    def __init__(self, config):
        super(AudioBiLSTM, self).__init__()
        self.num_classes = config['num_classes']
        self.learning_rate = config['learning_rate']
        self.dropout = config['dropout']
        self.hidden_dims = config['hidden_dims']
        self.rnn_layers = config['rnn_layers']
        self.embedding_size = config['embedding_size']
        self.bidirectional = config['bidirectional']

        self.build_model()

    def init_weight(net):
        for name, param in net.named_parameters():
            if 'bias' in name:
                nn.init.constant_(param, 0.0)
            elif 'weight' in name:
                nn.init.xavier_uniform_(param)

    def build_model(self):
        # attention layer
        self.attention_layer = nn.Sequential(
            nn.Linear(self.hidden_dims, self.hidden_dims),
            nn.ReLU(inplace=True))
        # self.attention_weights = self.attention_weights.view(self.hidden_dims, 1)

        self.lstm_net_audio = nn.LSTM(self.embedding_size,
                                      self.hidden_dims,
                                      num_layers=self.rnn_layers,
                                      dropout=self.dropout,
                                      bidirectional=self.bidirectional,
                                      batch_first=True)
        # self.lstm_net_audio = nn.GRU(self.embedding_size, self.hidden_dims,
        #                         num_layers=self.rnn_layers, dropout=self.dropout, batch_first=True)

        self.bn = nn.BatchNorm1d(3)

        # FC层
        self.fc_audio = nn.Sequential(
            nn.Dropout(self.dropout),
            nn.Linear(self.hidden_dims, self.hidden_dims),
            nn.ReLU(),
            nn.Dropout(self.dropout),
            nn.Linear(self.hidden_dims, self.num_classes),
            nn.ReLU(),
            # nn.Softmax(dim=1)
        )

    def attention_net_with_w(self, lstm_out, lstm_hidden):
        '''
        :param lstm_out:    [batch_size, len_seq, n_hidden * 2]
        :param lstm_hidden: [batch_size, num_layers * num_directions, n_hidden]
        :return: [batch_size, n_hidden]
        '''
        lstm_tmp_out = torch.chunk(lstm_out, 2, -1)
        # h [batch_size, time_step, hidden_dims]
        h = lstm_tmp_out[0] + lstm_tmp_out[1]
        #         h = lstm_out
        # [batch_size, num_layers * num_directions, n_hidden]
        lstm_hidden = torch.sum(lstm_hidden, dim=1)
        # [batch_size, 1, n_hidden]
        lstm_hidden = lstm_hidden.unsqueeze(1)
        # atten_w [batch_size, 1, hidden_dims]
        atten_w = self.attention_layer(lstm_hidden)
        # m [batch_size, time_step, hidden_dims]
        m = nn.Tanh()(h)
        # atten_context [batch_size, 1, time_step]
        # print(atten_w.shape, m.transpose(1, 2).shape)
        atten_context = torch.bmm(atten_w, m.transpose(1, 2))
        # softmax_w [batch_size, 1, time_step]
        softmax_w = F.softmax(atten_context, dim=-1)
        # context [batch_size, 1, hidden_dims]
        context = torch.bmm(softmax_w, h)
        result = context.squeeze(1)
        return result

    def forward(self, x):
        x, _ = self.lstm_net_audio(x)
        # x = self.bn(x)
        x = x.sum(dim=1)
        out = self.fc_audio(x)
        return out


def feature_extraction(positive, neutral, negative):
    positive_file = wave.open('./static/%s' % (positive))
    sr1 = positive_file.getframerate()
    nframes1 = positive_file.getnframes()
    wave_data1 = np.frombuffer(positive_file.readframes(nframes1), dtype=np.short).astype(np.float)
    len1 = nframes1 / sr1

    neutral_file = wave.open('./static/%s' % (neutral))
    sr2 = neutral_file.getframerate()
    nframes2 = neutral_file.getnframes()
    wave_data2 = np.frombuffer(neutral_file.readframes(nframes2), dtype=np.short).astype(np.float)
    len2 = nframes2 / sr2

    negative_file = wave.open('./static/%s' % (negative))
    sr3 = negative_file.getframerate()
    nframes3 = negative_file.getnframes()
    wave_data3 = np.frombuffer(negative_file.readframes(nframes3), dtype=np.short).astype(np.float)
    len3 = nframes3 / sr3

    if wave_data1.shape[0] < 1:
        wave_data1 = np.array([1e-4] * sr1 * 5)
    if wave_data2.shape[0] < 1:
        wave_data2 = np.array([1e-4] * sr2 * 5)
    if wave_data3.shape[0] < 1:
        wave_data3 = np.array([1e-4] * sr3 * 5)

    return np.array([[wav2vlad(wave_data1, sr1), wav2vlad(wave_data2, sr2), \
                      wav2vlad(wave_data3, sr3)]])


def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'PUT,GET,POST,DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    return response


# webm 转 wav
def webm2wav(webm_path, wav_path):
    sr = 16000
    channel = 1
    command = "ffmpeg -loglevel quiet -i {} -ac {} -ar {} {}".format(webm_path, channel, sr, wav_path)
    if os.path.exists(wav_path):  # 如果文件存在
        # 删除文件，可使用以下两种方法。
        os.remove(wav_path)
    os.system(command)


cluster_size = 16
model = torch.load('./static/gru_vlad256_128_11.76.pt')
torch.save(model.state_dict(), './static/model_state_dict.pt')

app = Flask(__name__, static_folder='./static')
app.after_request(after_request)
# connect database
app.config.from_object(config)
db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    positive_wav = db.Column(db.String(100))
    negative_wav = db.Column(db.String(100))
    neutral_wav = db.Column(db.String(100))
    depscore = db.Column(db.Integer)
    score = db.Column(db.Integer)

    # time = db.Column(db.DateTime,default = db.CURRENT_TIMESTAMP)
    def __repr__(self):
        # %r是用repr()方法处理对象，返回类型本身，而不进行类型转化
        return '<User %r>' % self.body


def add_database(positive_url, negative_url, neutral_url, depscore, score):
    user = User(positive_wav=positive_url, negative_wav=negative_url, neutral_wav=neutral_url, depscore=depscore,
                score=score)
    db.session.add(user)
    db.session.commit()


def upload_to_cloud(file_name, file_path):
    # 需要填写你的 Access Key 和 Secret Key
    ak = "#"
    sk = "#"
    # 构建鉴权对象
    q = Auth(ak, sk)
    # 要上传的空间
    bucket_name = 'hci'
    domain_prefix = "qufdjoslw.hd-bkt.clouddn.com"
    # 上传到七牛后保存的文件名
    key = file_name
    # 生成上传 Token，可以指定过期时间等
    token = q.upload_token(bucket_name, key, 3600)
    ret, info = put_file(token, key, file_path)
    print(type(info.status_code), info)
    if info.status_code == 200:
        return domain_prefix + '/' + file_name
    return None


@app.route('/')
def hello_world():
    return "hello"


@app.route('/api/record', methods=['GET'])
def record():
    global model
    pos_filename = request.args.get('positive')
    neg_filename = request.args.get('negative')
    neutral_filename = request.args.get('neutral')
    score = request.args.get('score')
    depscore = request.args.get('depscore')

    # with open('./static/score_record.txt', 'a') as f:
    #     f.write('positive= {} neutral={} and negative= {} score= {}'.format(pos_filename, neutral_filename, neg_filename, score))

    # upload to cloud
    pos_path = './static/' + pos_filename
    pos_url = upload_to_cloud(pos_filename, pos_path)
    neg_path = './static/' + neg_filename
    neg_url = upload_to_cloud(neg_filename, neg_path)
    neu_path = './static/' + neutral_filename
    neu_url = upload_to_cloud(neutral_filename, neu_path)

    # record data to database
    add_database(pos_url, neg_url, neu_url, depscore, score)
    # delete local wav files
    if os.path.exists(pos_path):  # 如果文件存在
        os.remove(pos_path)
    if os.path.exists(neg_path):  # 如果文件存在
        os.remove(neg_path)
    if os.path.exists(neu_path):  # 如果文件存在
        os.remove(neu_path)

    result = {'result': 'ok'}
    return Response(json.dumps(result), mimetype='application/json')


@app.route('/api/upload', methods=['POST', 'OPTIONS'])
def upload():
    f_audio = request.files['file']
    uuid_str = str(uuid.uuid4())
    webm_path = './static/' + secure_filename('%s.webm' % (uuid_str))
    wav_path = './static/' + secure_filename('%s.wav' % (uuid_str))
    f_audio.save(webm_path)
    webm2wav(webm_path, wav_path)

    if os.path.exists(webm_path):  # 如果文件存在
        os.remove(webm_path)

    text_exchange.exchange(wav_path)

    result = {'filename': '%s.wav' % (uuid_str)}
    return Response(json.dumps(result), mimetype='application/json')


@app.route('/api/predict', methods=['GET'])
def predict():
    global model
    pos_filename = request.args.get('positive')
    neg_filename = request.args.get('negative')
    neutral_filename = request.args.get('neutral')

    # feature
    feat = feature_extraction(pos_filename, neutral_filename, neg_filename)
    x = torch.from_numpy(feat).type(torch.FloatTensor)
    with torch.no_grad():
        output = model(x.squeeze(2))

    result = {'depression_score': output.flatten().detach().numpy().tolist()}

    return Response(json.dumps(result), mimetype='application/json')


if __name__ == '__main__':
    app.run(debug=True)

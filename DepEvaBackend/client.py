# import requests
#
# upload_url = 'http://119.29.171.121:80/upload'
# predict_url = 'http://127.0.0.1:5000/predict'
#
#
# r = requests.post(upload_url, files=files)
#
# # params = {
# #     'positive': 'audio_db5a80a3-66e0-466d-b790-f1e49442ea51.wav', \
# #         'negative': 'audio_744e14d3-151d-4ca7-94b1-2c04bc3f8101.wav', \
# #             'neutral': 'audio_38954001-d537-4738-a28d-b20d5be2482b.wav'}
# # r = requests.get(predict_url, params=params)
#
# print(r.status_code)
# print(r.json())
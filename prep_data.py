import json
from random import shuffle
from tqdm import tqdm

f = open("data/dictionary.json", "r")
data = json.load(f)
f.close()

data_keys = list(data.keys())

shuffle(data_keys)

t = len(data_keys)//4

data_keys_part1 = data_keys[0:t]
data_keys_part2 = data_keys[t:2*t]
data_keys_part3 = data_keys[2*t:3*t]
data_keys_part4 = data_keys[3*t:]

data_part1 = {}
data_part2 = {}
data_part3 = {}
data_part4 = {}

for k in tqdm(data_keys_part1):
    if data[k].startswith("See ") or data[k].startswith("Same as") or len(data[k]) < 15 or len(data[k]) > 150:
        continue
    else:
        data_part1[k] = data[k].replace("\n", " ")

txt1 = f"""const data_words = {json.dumps(data_part1)};

var script = document.createElement("script");
script.setAttribute("src", "js/crosswords.js");
script.setAttribute("type", "text/javascript");
document.body.appendChild(script);

"""

f = open("data/data1.js", "w")
f.write(txt1)
f.close()

for k in tqdm(data_keys_part2):
    if data[k].startswith("See ") or data[k].startswith("Same as") or len(data[k]) < 15 or len(data[k]) > 150:
        continue
    else:
        data_part2[k] = data[k].replace("\n", " ")

txt2 = f"""const data_words = {json.dumps(data_part2)};

var script = document.createElement("script");
script.setAttribute("src", "js/crosswords.js");
script.setAttribute("type", "text/javascript");
document.body.appendChild(script);

"""

f = open("data/data2.js", "w")
f.write(txt2)
f.close()
        
for k in tqdm(data_keys_part3):
    if data[k].startswith("See ") or data[k].startswith("Same as") or len(data[k]) < 15 or len(data[k]) > 150:
        continue
    else:
        data_part3[k] = data[k].replace("\n", " ")

txt3 = f"""const data_words = {json.dumps(data_part3)};

var script = document.createElement("script");
script.setAttribute("src", "js/crosswords.js");
script.setAttribute("type", "text/javascript");
document.body.appendChild(script);

"""

f = open("data/data3.js", "w")
f.write(txt3)
f.close()
        
for k in tqdm(data_keys_part4):
    if data[k].startswith("See ") or data[k].startswith("Same as") or len(data[k]) < 15 or len(data[k]) > 150:
        continue
    else:
        data_part4[k] = data[k].replace("\n", " ")

txt4 = f"""const data_words = {json.dumps(data_part4)};

var script = document.createElement("script");
script.setAttribute("src", "js/crosswords.js");
script.setAttribute("type", "text/javascript");
document.body.appendChild(script);

"""

f = open("data/data4.js", "w")
f.write(txt4)
f.close()
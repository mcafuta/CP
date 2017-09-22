# -*- coding: utf-8 -*-
from flask import *
from database import database
import random
import json
import re

app = Blueprint('vegenere', __name__)

abc = u"ABCČDEFGHIJKLMNOPQRSŠTUVWXYZŽ"

foreign = {'sl': set(['Q', 'W', 'X', 'Y']),
           'en': set([u'Č', u'Š', u'Ž'])}

level_trans = {2: 0, -1: 1}

def keywords(level, language='None'):
    #zaenkrat hardcodano ker nimam baze
    keywords = {'sl':{0:['val', 'pes'], 1:['miza', 'kljuc'], 2:['jagoda', 'potovanje']}, 'en': {0:['pie','sea', 'txt','fit', 'run', 'ack', 'dos'], 1:['lemon', 'party', 'ball', 'fight', 'sport', 'code', 'disk', 'phone', 'debug', 'unix'], 2:['chocolate', 'cryptography', 'computer', 'cipher', 'vegenere']}, 'None': {0:['pot', 'abc'], 1:['test', 'poker'], 2:['banana', 'internet']}}
    ix = random.randrange(0,2)
    keys = keywords.get(language)
    return keys.get(level)[ix]


def indices2(level, language=None):

    db = database.dbcon()
    cur = db.cursor()
    if language == None:
        cur.execute("SELECT id FROM substitution WHERE level = %s ORDER BY id",
                    [level_trans.get(level, level)])
    else:
        cur.execute("SELECT id FROM substitution WHERE level = %s AND language = %s ORDER BY id",
                    [level_trans.get(level, level), language])
    ids = [x[0] for x in cur.fetchall()]
    cur.close()
    if level in level_trans:
        random.seed("Random seed:)%d" % level)
        random.shuffle(ids)
        random.seed()
    return ids


def indices(level, language=None):
    return 'text'


def getText2(id):
    db = database.dbcon()
    cur = db.cursor()
    cur.execute("SELECT text, language FROM substitution WHERE id = %s", [id])
    txt = cur.fetchone()
    cur.close()
    return (txt[0].decode("UTF-8"), txt[1])

#hardcoded text dokler ni povezave na bazo
def getText(id):
    txt = "LOREM IPSUM DOLOR SIT AMET, CONSECTETUER ADIPISCING ELIT, SED DIAM NONUMMY NIBH EUISMOD TINCIDUNT UT LAOREET DOLORE MAGNA ALIQUAM ERAT VOLUTPAT."
    return (txt, 'en')

#zasifrira sporocilo
def crypt(text, keyword, lang = None):
    xyz = [x for x in abc if x not in foreign.get(lang)]
    print(xyz)
    keyword = [x.upper() for x in keyword]
    #keyphrase = [keyword[x%len(keyword)] if not text[x].isspace() else ' ' for x in range(0,len(text))]
    keyphrase = [keyword[x % len(keyword)] for x in range(0, len(text))]
    print(keyphrase)
    #pri presledku preskoci crko iz gesla
    #enc_text = [xyz[(xyz.index(text[i]) + xyz.index(keyphrase[i]))%len(xyz)] if ((not text[i].isspace()) and text[i] in xyz) else text[i] for i in range(0,len(text))]
    #print(enc_text);
    #tam kjer je v osnovnem textu presledek je tudi v keyphrasu ampak ne zamenja crke
    ix = 0
    ix_s = 0
    for x in text:
        if not x.isspace() and x in xyz:
            keyphrase[ix] = keyword[ix_s % len(keyword)]
            ix_s+=1
        else:
            keyphrase[ix] = x
        ix+=1
    enc_text = [xyz[(xyz.index(text[i]) + xyz.index(keyphrase[i])) % len(xyz)] if not text[i].isspace() and text[i].isalpha() else text[i] for i in range(0, len(text))]
    #return enc_text
    print(enc_text)
    return ''.join(enc_text)


@app.route("/")
def index():
    return redirect('vegenere/easy')


@app.route("/<difficulty>")
@app.route("/<difficulty>/<int:idx>")
@app.route("/<difficulty>/<language>/<int:idx>")
@app.route("/<difficulty>/<language>")
def play(difficulty, idx=-1, language=None):
    if (difficulty == "ready"):
        level = 3
    elif (difficulty == "hard"):
        level = 2
    elif (difficulty == "medium"):
        level = 1
    else:
        level = 0
    #najde id-je? vseh primernih textov glede na izbran lvl&lang
    if idx < 0 and level == 3:
        return render_template("vegenere.ready.html", num=0)
    if idx < 0 or idx >= 1:
        idx = 0
    text, lang = getText('X')
    print(text)
    keyword = keywords(level, 'en')
    if level == 3:
        cipher = text
    else:
        cipher = crypt(text, keyword, 'en')
    return render_template("vegenere.play.html",
                           nav="vegenere", next=(idx + 1) % 1, lang=lang,
                           difficulty=difficulty, level=level, input=json.dumps(cipher),
                           foreign=len(foreign[lang].intersection(text.upper())) > 0)

def play2(difficulty, idx=-1, language=None):
    if (difficulty == "ready"):
        level = 3
    elif (difficulty == "hard"):
        level = 2
    elif (difficulty == "medium"):
        level = 1
    else:
        level = 0
    #najde id-je? vseh primernih textov glede na izbran lvl&lang
    texts = indices(level, language)
    #ka je ta ready???
    if idx < 0 and level == 3:
        return render_template("vegenere.ready.html", num=len(texts))
    #izbere random index iz mnozice ustreznih
    if idx < 0 or idx >= len(texts):
        idx = random.randrange(len(texts))
    #vrne text na podlagi idja glede na index
    text, lang = getText(texts[idx])
    keyword = keywords(level, language)
    if level in [-1, 2]:
        text = re.sub(r'\s', '', text)
    if level == 3:
        cipher = text
    else:
        cipher = crypt(text, keyword, language)
    return render_template("vegenere.play.html",
                           nav="vegenere", next=(idx + 1) % len(texts), lang=lang,
                           difficulty=difficulty, level=level, input=json.dumps(cipher),
                           foreign=len(foreign[lang].intersection(text.upper())) > 0)





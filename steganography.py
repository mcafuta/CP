# -*- coding: utf-8 -*-
from flask import *
from database import database
from PIL import Image
import os
import re
import json
import random

try:
    from StringIO import StringIO
    encode = unicode.encode
    bytes = lambda x: x
    byte = chr
    spyt = ord
    chew = lambda x: x
    empty = ''
except ImportError:
    from io import BytesIO as StringIO
    encode = bytes
    byte = lambda x: bytes([x])
    spyt = lambda x: x
    chew = byte
    empty = bytes()

app = Blueprint('steganography', __name__)

if not hasattr(Image, 'frombytes'):
    Image.frombytes = Image.fromstring

def initSession():
    if 'sessid' not in session:
        session['sessid'] = os.urandom(16)

def tobytes(img):
    if hasattr(img, 'tobytes'):
        return bytes(img.tobytes())
    else:
        return img.tostring()

@app.route("/")
def index():
    return "TODO"

@app.route("/colors")
def colors():
    return render_template("steganography.colors.html", nav = "steganography")

@app.route("/images")
@app.route("/images/<int:idx>", methods=['GET', 'POST'])
def images(idx=None):
    initSession()
    db = database.dbcon()
    cur = db.cursor()
    if request.method == 'POST':
        text = encode(request.form["text"], "utf-8") + byte(0)
        newname = request.form["newname"]
        try:
            offset = int(request.form["offset"])
        except:
            offset = 0
        if len(newname) > 0:
            cur.execute("SELECT data FROM slika WHERE id = %s", [idx])
            r = cur.fetchone()
            inimg = Image.open(StringIO(r[0]))
            data = tobytes(inimg)
            if offset < 0 or offset > len(data) - 7:
                offset = 0
            last = min(len(text), (len(data) - (offset%8))/8)
            stego = [chew(x) for x in data]
            for i in range(last):
                o = spyt(text[i])
                for j in range(8):
                    stego[offset+8*i+j] = byte((spyt(data[offset+8*i+j]) & 0xFE) | ((o >> (7-j)) & 1))
            try:
                outimg = Image.frombytes(inimg.mode, inimg.size, empty.join(stego))
                out = StringIO()
                outimg.save(out, format="PNG")
                png = out.getvalue()
                out.close()
                cur.execute("INSERT INTO slika (name, data, session) VALUES (%s, %s, %s)",
                            (newname, png, session['sessid']))
                db.commit()
                return redirect(url_for(".images", idx = cur.lastrowid))
            except:
                text = text[:-1]
                error = True
                errstr = u"Datoteka že obstaja!"
        else:
            text = text[:-1]
            error = True
            errstr = u"Ime datoteke ni navedeno!"
    else:
        text = ""
        newname = ""
        offset = 0
        error = False
        errstr = ""
    cur.execute("SELECT id, name, DATE_FORMAT(time, '%e.%c.%Y %H:%i') AS ftime, session FROM slika ORDER BY time DESC")
    imgs = cur.fetchall()
    if idx == None and len(imgs) > 0:
        idx = imgs[-1][0]
    if idx == None:
        r = None
    else:
        cur.execute("SELECT name, data FROM slika WHERE id = %s", [idx])
        r = cur.fetchone()
    cur.close()
    if r == None:
        name, data = None, ""
    else:
        name, png = r
        img = Image.open(StringIO(png))
        data = tobytes(img)
        if newname == "":
            m = re.match(r'^(.*[^0-9])[0-9]*$', name)
            if m == None:
                newname = "slika" + str(random.randrange(1000))
            else:
                newname = m.group(1) + str(random.randrange(1000))
    return render_template("steganography.images.html", idx=idx, name=name,
                    data=''.join("%d" % (spyt(x)&1) for x in data), imgs=imgs,
                    text=text, newname=newname, offset=offset,
                    error=error, errstr=errstr, session=session['sessid'])

@app.route("/show/<int:idx>")
def show(idx):
    db = database.dbcon()
    cur = db.cursor()
    cur.execute("SELECT data FROM slika WHERE id = %s", [idx])
    r = cur.fetchone()
    cur.close()
    if r == None:
        abort(404)
    response = make_response(r[0])
    response.headers['Content-Type'] = 'image/png'
    return response

@app.route("/delete/<int:idx>/<int:ret>", methods=['POST'])
def delete(idx, ret):
    initSession()
    db = database.dbcon()
    cur = db.cursor()
    cur.execute("DELETE FROM slika WHERE id = %s AND session = %s",
                (idx, session['sessid']))
    r = cur.fetchone()
    c = cur.rowcount
    cur.close()
    if c == 0:
        abort(403)
    db.commit()
    return redirect(url_for(".images", idx=ret))

#!/usr/bin/env python3
"""Envia ficheiros para uma pasta da Google Drive (PNG, JPG, TXT) com OAuth de utilizador.

Uso: python3 drive_upload.py <id-da-pasta> <ficheiro> [<ficheiro> ...]

Precisa de três variáveis de ambiente (configuradas no ambiente da sessão, nunca no chat):
  GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, GOOGLE_DRIVE_REFRESH_TOKEN
O refresh token deve ter o âmbito https://www.googleapis.com/auth/drive.file.
Se já existir na pasta um ficheiro com o mesmo nome, é substituído (mantém o link).
Escreve uma linha por ficheiro: <nome>\t<id>\t<link>.
"""
import json
import mimetypes
import os
import ssl
import sys
import urllib.parse
import urllib.request
import uuid

API = "https://www.googleapis.com/drive/v3/files"
UPLOAD = "https://www.googleapis.com/upload/drive/v3/files"


def _ctx():
    bundle = "/root/.ccr/ca-bundle.crt"
    return ssl.create_default_context(cafile=bundle) if os.path.exists(bundle) else ssl.create_default_context()


def _req(url, data=None, headers=None, method=None):
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    with urllib.request.urlopen(req, context=_ctx(), timeout=120) as r:
        return json.loads(r.read() or b"{}")


def access_token():
    missing = [k for k in ("GOOGLE_DRIVE_CLIENT_ID", "GOOGLE_DRIVE_CLIENT_SECRET", "GOOGLE_DRIVE_REFRESH_TOKEN") if not os.environ.get(k)]
    if missing:
        sys.exit("Faltam variáveis de ambiente: " + ", ".join(missing))
    body = urllib.parse.urlencode({
        "client_id": os.environ["GOOGLE_DRIVE_CLIENT_ID"],
        "client_secret": os.environ["GOOGLE_DRIVE_CLIENT_SECRET"],
        "refresh_token": os.environ["GOOGLE_DRIVE_REFRESH_TOKEN"],
        "grant_type": "refresh_token",
    }).encode()
    return _req("https://oauth2.googleapis.com/token", body, {"Content-Type": "application/x-www-form-urlencoded"})["access_token"]


def existing_id(token, folder, name):
    q = "name = '%s' and '%s' in parents and trashed = false" % (name.replace("'", "\\'"), folder)
    url = API + "?" + urllib.parse.urlencode({"q": q, "fields": "files(id)"})
    files = _req(url, headers={"Authorization": "Bearer " + token}).get("files", [])
    return files[0]["id"] if files else None


def upload(token, folder, path):
    name = os.path.basename(path)
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    with open(path, "rb") as f:
        content = f.read()
    fid = existing_id(token, folder, name)
    meta = {"name": name} if fid else {"name": name, "parents": [folder]}
    boundary = uuid.uuid4().hex
    body = (
        f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{json.dumps(meta)}\r\n"
        f"--{boundary}\r\nContent-Type: {mime}\r\n\r\n"
    ).encode() + content + f"\r\n--{boundary}--\r\n".encode()
    url = (UPLOAD + "/" + fid if fid else UPLOAD) + "?uploadType=multipart&fields=id,webViewLink"
    res = _req(url, body, {"Authorization": "Bearer " + token, "Content-Type": "multipart/related; boundary=" + boundary},
               method="PATCH" if fid else "POST")
    return name, res["id"], res.get("webViewLink", "")


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    folder, paths = sys.argv[1], sys.argv[2:]
    token = access_token()
    for p in paths:
        print("\t".join(upload(token, folder, p)))


if __name__ == "__main__":
    main()

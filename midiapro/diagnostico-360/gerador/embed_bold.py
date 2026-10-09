"""Acrescenta a Google Sans Bold (embedBold) ao DOCX gerado pelo docx-js e
activa embedTrueTypeFonts, para o documento abrir com a fonte certa em Word."""
import re, sys, uuid, zipfile

src, bold_ttf, dst = sys.argv[1:4]

guid = str(uuid.uuid4())
hexs = guid.replace("-", "")
key = bytes(int(hexs[30 - 2 * i:32 - 2 * i], 16) for i in range(16))
data = bytearray(open(bold_ttf, "rb").read())
for i in range(32):
    data[i] ^= key[i % 16]

zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
for item in zin.infolist():
    buf = zin.read(item.filename)
    if item.filename == "word/fontTable.xml":
        s = re.sub(r'w:fontKey="(\{[^"]+\})"', lambda m: 'w:fontKey="' + m.group(1).upper() + '"', buf.decode())
        tag = f'<w:embedBold r:id="rIdBold" w:fontKey="{{{guid.upper()}}}"/>'
        s = s.replace("</w:font>", tag + "</w:font>", 1)
        buf = s.encode()
    elif item.filename == "word/_rels/fontTable.xml.rels":
        s = buf.decode()
        rel = '<Relationship Id="rIdBold" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" Target="fonts/font2.odttf"/>'
        s = s.replace("</Relationships>", rel + "</Relationships>")
        buf = s.encode()
    elif item.filename == "word/settings.xml":
        s = buf.decode()
        s = s.replace("<w:displayBackgroundShape/>", "<w:displayBackgroundShape/><w:embedTrueTypeFonts/><w:saveSubsetFonts/>", 1)
        buf = s.encode()
    zout.writestr(item, buf)
zout.writestr("word/fonts/font2.odttf", bytes(data))
zout.close()
print("OK", dst)

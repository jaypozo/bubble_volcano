import socket
import piface.pfio as pfio

  
def bubbleson():
  print "bubs on"
  pfio.digital_write(0,1)
  return

def bubblesoff():
  print "bubs off"
  pfio.digital_write(0,0)
  return

host = ''
port = 9999
backlog = 5
size = 1024
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR,1)
s.bind((host,port))
s.listen(backlog)
pfio.init()

while 1:
  client, address = s.accept()
  data = client.recv(size)
  if data:
    client.send(data)
    if data == "ron":
      bubbleson()
    if data == "roff":
      bubblesoff()
  client.close()

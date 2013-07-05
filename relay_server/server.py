import SocketServer
import piface.pfio as pfio

class MyTCPHandler(SocketServer.BaseRequestHandler):
  pfio.init()
  
  def bubbleson(something):
    print "bubs on"
    pfio.digital_write(0,1)
    return

  def bubblesoff(something):
    print "bubs off"
    pfio.digital_write(0,0)
    return
  def handle(self):
    self.data = self.request.recv(1024).strip()

    if self.data == "ron":
      self.bubbleson()
    if self.data == "roff":
      self.bubblesoff()
    
    self.request.sendall("got it")

if __name__ == "__main__":
  HOST, PORT = "localhost",9999

  server = SocketServer.TCPServer((HOST,PORT), MyTCPHandler)
  server.serve_forever()

import piface.pfio as pfio
from bottle import route, run, template
from threading import Timer

def bubbleson():
  print "bubs on"
  pfio.digital_write(0,1)
  return

def bubblesoff():
  print "bubs off"
  pfio.digital_write(0,0)
  return

pfio.init()

@route('/bubbles/<state>')
def index(state='on'):
  if state == 'on':
    bubbleson()
    return "on"
  if state == 'off':
    bubblesoff()
    return "off"

run(host='localhost', port=8080)

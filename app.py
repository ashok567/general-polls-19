from tornado.web import RequestHandler, Application
import tornado.ioloop
import os.path
import process
import json


class MainHandler(RequestHandler):
    def get(self):
        self.render("index.html")
    
    # def post(self):
    #     self.set_header("Content-Type", "text/plain")
    #     url = self.get_body_argument("url")
    #     data = process.read_data()
    #     self.write({'message': data})
    #     self.redirect("/fetch")


class DataHandler(RequestHandler):
    def get(self):
        data = process.read_data()
        self.write({'response': json.loads(data)})

# class TodoItem(RequestHandler):
#   def post(self, _):
#     items.append(json.loads(self.request.body))
#     self.write({'message': 'new item added'})

settings = dict(
    template_path = os.path.join(os.path.dirname(__file__),'templates'),
    # static_path = os.path.join(os.path.dirname(__file__),'static'),
    debug=True
)


def make_app():
    return Application(
    [
        (r'/', MainHandler),
        (r'/data', DataHandler),
        (r'/(.*)', tornado.web.StaticFileHandler, {"path": ""}),

    ],**settings)


if __name__ == '__main__':
    print("Server is running at 9000")
    app = make_app()
    app.listen(9000)
    tornado.ioloop.IOLoop.current().start()
from flask import Flask, jsonify, request
from flask_cors import CORS
import flask_sqlalchemy as sqlalchemy
import time
import datetime 

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sqlalchemy-demo.db'

db = sqlalchemy.SQLAlchemy(app)
#13:08 May 25, 2015
class Smile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # TODO 1: add all of the columns for the other table attributes
    space = db.Column(db.String(128))
    title = db.Column(db.String(64))
    story = db.Column(db.String(2048))
    happiness_level = db.Column(db.Integer)
    like_count = db.Column(db.Integer)
    created_at = db.Column(db.String, default = datetime.datetime.utcnow)
    updated_at = db.Column(db.String, default = datetime.datetime.utcnow)
base_url = '/api/'

# index
# loads all smiles given a space, count parameter and order_by parameter 
# if the count param is specified and doesn't equal all limit by the count
# if the order_by param is specified order by param otherwise load by updated_at desc
# return JSON
@app.route(base_url + 'smiles') # route binds function to url 
def index():
    space = request.args.get('space', None) 

    if space is None:
        return "Must provide space", 500

    count = request.args.get('count', None)
    order_by = request.args.get('order_by', None) # None = return default

    query = Smile.query.all()   # returns all rows in the table 
    # Query is an array of JSON obj
    # TODO 2: set the column which you are ordering on (if it exists)
    if order_by: 
        query = Smile.query.order_by(order_by)
    else:
       query = Smile.query.order_by(Smile.updated_at.desc())
    # TODO 3: limit the number of posts based on the count (if it exists)
    if count: 
       query = Smile.query.limit(count)
    
    result = []
    for row in query:
        result.append(
            row_to_obj(row) # you must call this function to properly format 
        )

    return jsonify({"status":1, "smiles":result}) # Each element is a key, 


# show
# loads a smile given the id as a value in the URL

# TODO 4: create the route for show
# show smile based on id
@app.route(base_url + 'smiles/<int:id>', methods=['GET']) # route binds function to url 
def show(id):
    row = Smile.query.filter_by(id=id).first()
    return jsonify({"smile": row_to_obj(row), "status":1}), 200
    
# create
# creates a smile given the params
# TODO 5: create the route for create
#var url = "/api/smiles?space=nowifizone&" + smile.title + '&' + smile.story + '&' + smile.happiness_level + '&' +smile.like_count;

@app.route(base_url + 'smiles', methods=['POST']) # route binds function to url 
def create():
    smile = Smile(**request.json)
    db.session.add(smile)       # = INSERT sql statment
    db.session.commit()
    db.session.refresh(smile)   

    return jsonify({"status":1,"smile": row_to_obj(smile) }),200

# delete_smiles
# delete given an space
# delete all smiles in that space

# TODO 6: create the route for delete_smiles
@app.route(base_url + 'smiles', methods=['DELETE'])
def delete():
    
    db.session.query(Smile).delete()
    db.session.commit()
    return jsonify({"status":1}), 200

# post_like
# loads a smile given an ID and increments the count by 1

# TODO 7: create the route for post_like 
@app.route(base_url + 'smiles/<int:id>/like', methods=['POST'] )
def post_like(id): 
    row = Smile.query.filter_by(id=id).first() 
    row.like_count += 1
    db.session.commit()

    return jsonify({"status":1 , "smile": row_to_obj(row)} ), 200

def row_to_obj(row):
    row = {
            "id": row.id,
            "space": row.space,
            "title": row.title,
            "story": row.story,
            "happiness_level": row.happiness_level,
            "like_count": row.like_count,
            "created_at": row.created_at,
            "updated_at": row.updated_at
        }

    return row

  
def main():
    db.create_all() # creates the tables you've provided
    app.run()       # runs the Flask application  

if __name__ == '__main__':
    main()

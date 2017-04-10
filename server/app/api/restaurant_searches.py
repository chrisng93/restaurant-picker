"""
    RestaurantSearch CRUD
"""
from functools import reduce
from flask import Blueprint, request, abort, g
from flask_login import login_required
from ..common.services import RestaurantSearch
from . import route

bp = Blueprint('restaurant_search', __name__, url_prefix='/api/restaurant/search')


@route(bp, '/<int:id>', methods=['GET'])
def get_search(id):
    return RestaurantSearch.get(id).as_dict()


@route(bp, '/', methods=['POST'])
def create_search():
    req_fields = ['user_location', 'transport_method', 'desired_travel_time', 'food_type']
    given_fields = list(request.json.keys())
    has_all_fields = reduce((lambda x, y: x and y), [field in req_fields for field in given_fields])
    if not request.json or not has_all_fields or len(given_fields) != len(req_fields):
        abort(400)
    if 'user' in g and g.user is not None and g.user.is_authenticated:
        request.json['user_id'] = g.user.get_id()
    rs = RestaurantSearch.create(**request.json).as_dict()
    # hit google maps api to get radius given user_location, transport_method, and desired_travel_time
    # hit yelp api to get restaurants w/ certain food_type within given radius of user_location
    # run results through ranking algorithm and return to client
    return


@route(bp, '/<int:id>', methods=['PUT'])
@login_required
def update_search(id):
    if not request.json:
        abort(400)
    if 'user' in g and g.user and g.user.is_authenticated and g.user.get_id() != RestaurantSearch.get(id).get('user_id'):
        abort(401)
    request.json['id'] = id
    return RestaurantSearch.update(**request.json).as_dict()


@route(bp, '/<int:id>', methods=['DELETE'])
@login_required
def delete_search(id):
    if 'user' in g and g.user and g.user.is_authenticated and g.user.get_id() != RestaurantSearch.get(id).get('user_id'):
        abort(401)
    return RestaurantSearch.delete(id)

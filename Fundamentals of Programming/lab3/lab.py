#!/usr/bin/env python3

import pickle
# NO ADDITIONAL IMPORTS ALLOWED!

# Note that part of your checkoff grade for this lab will be based on the
# style/clarity of your code.  As you are working through the lab, be on the
# lookout for things that would be made clearer by comments/docstrings, and for
# opportunities to rearrange aspects of your code to avoid repetition (for
# example, by introducing helper functions).


def transform_data(raw_data):
    # returns a dictionary with an actor ID as an int key and a set of movie IDs
    # that the actor was in as its value. string keys refer to movie IDs and its values
    # are a set of actor IDs that participated in the movie
    transformed = {}
    for pair in raw_data:
        # adds new actors and pairs into new transformed database
        for i in range(2):
            if pair[i] not in transformed.keys():
                transformed[pair[i]] = set()
            transformed[pair[i]].add(pair[i])
            transformed[pair[i]].add(pair[(i+1)%2])
        # adds new movies as keys and set of actors as values
        if str(pair[2]) not in transformed.keys():
            transformed[str(pair[2])] = set()
        transformed[str(pair[2])].add(pair[0])
        transformed[str(pair[2])].add(pair[1])
    return transformed


def acted_together(data, actor_id_1, actor_id_2):
    # Given a database and two IDs representing actors, returns a bool
    # on if they've acted together before
    return actor_id_2 in data[actor_id_1]


def actors_with_bacon_number(data, n):
    # Given a database and the desired bacon number (n), returns
    # a Python set containing the ID numbers of all the actors 
    # with that Bacon number
    # start with bacon
    actors = {4724}
    new_actors = {4724}
    all_actors = {4724}
    for i in range(n):
        new_actors = set()
        # if out of bounds return empty set
        if actors in all_actors or n > len(data.keys()):
            return set()
        # update new_actors with actors of bacon number i + 1
        for actor in actors:
            new_actors.update(set(data[actor]))
            new_actors = new_actors - all_actors
        all_actors.update(new_actors)
        actors = new_actors
    return new_actors


def bacon_path(data, actor_id):
    # Given a database and an actor ID, returns the shortest list 
    # detailing a "Bacon path" from Kevin Bacon to the actor denoted
    # by actor_id. If no path exists, return None.
    # create a path where goal_test_function: actor passed in equals actor_id
    return create_path(data, 4724, lambda x: x == actor_id)


def actor_to_actor_path(data, actor_id_1, actor_id_2):
    # Given a database and two actor IDs, returns the shortest list 
    # detailing a path from the first actor to the second. If no path
    # exists, return None
    # create a path where goal_test_function: actor passed in equals actor_id_2
    return create_path(data, actor_id_1, lambda x: actor_id_2 == x)

def create_path(data, actor_id_1, goal_test_function):
    # Given a database and two actor IDs, returns the shortest list 
    # detailing a path from the first actor to a second (given goal_test_function is true). If no path
    # exists, return None
    if goal_test_function(actor_id_1):
        return [actor_id_1]
    paths = [[actor_id_1]]
    expanded = {actor_id_1}
    i = 0
    # for each path in paths, perform dfs until goal_test_function
    while i < len(paths):
        current_path = paths[i]
        new_path = []
        actors = data[current_path[-1]]
        for actor in actors:
            # if goal_test_function is true, return the current path
            if goal_test_function(actor):
                if actor != actor_id_1:
                    current_path.append(actor)
                return current_path
            # if currect actor has not be expanded yet, add to paths to expand later
            if actor not in expanded:
                new_path = [*current_path, actor]
                paths.append(new_path)
                expanded.add(actor)
        i += 1
    return None


def actor_to_actor_movie_path(data, movie_data, actor_id_1, actor_id_2):
    # Given a database, a movie database and two actor ids, returns a path of movies 
    # connecting the two actors
    path = create_path(data, actor_id_1, lambda x: x == actor_id_2)
    movie_path = []
    for i in range(len(path) - 1):
        movie_path.append(list(movie_data[path[i]].intersection(movie_data[path[i+1]]))[0])
    return movie_path

def actor_path(data, actor_id_1, goal_test_function):
    # Given a database, an actor ID, and a goal_test_function, returns a list containing 
    # actor IDs, representing the shortest possible path from the given actor ID to any 
    # actor that satisfies the goal test function
    return create_path(data, actor_id_1, goal_test_function)


def actors_connecting_films(data, film1, film2):
    # Given a database and two movie IDs, return the shortest possible list of actor 
    # ID numbers (in order) that connect those two films
    film1_actors = data[str(film1)]
    film2_actors = data[str(film2)]
    all_paths = []
    # for each actor in film1, perform dfs to each actor in film2
    for actor in film1_actors:
        this_path = actor_path(data, actor, lambda a: a in film2_actors)
        if this_path:
            all_paths.append(this_path)
    # return the shortest path or None if no paths
    if len(all_paths) == 0:
        return None
    lengths = [len(p) for p in all_paths]
    path = all_paths[lengths.index(min(lengths))]
    return path

def transform_data_movies(raw_data):
    # returns a dictionary with an actor ID as a key and a set of movie IDs
    # that the actor was in as its value
    transformed = {}
    for pair in raw_data:
        for i in range(2):
            # for each actor, add movie into their values
            if pair[i] not in transformed.keys():
                transformed[pair[i]] = set()
            transformed[pair[i]].add(pair[2])
    return transformed


def transform_data_actors_in_movie(raw_data):
    # returns a dictionary with a movie ID as a key and a set of actor IDs
    # that participated in the movie as its value
    transformed = {}
    for pair in raw_data:
        # add actors into list for the correponding movie key
        if pair[2] not in transformed.keys():
            transformed[pair[2]] = set()
        transformed[pair[2]].add(pair[0])
        transformed[pair[2]].add(pair[1])
    return transformed


if __name__ == '__main__':
    with open('resources/small.pickle', 'rb') as f:
        smalldb = pickle.load(f)
        # print(smalldb)
    with open('resources/names.pickle', 'rb') as f:
        namesdb = pickle.load(f)
        # print(type(namesdb))
        # print(namesdb['Olivia Delcan'])
        # print(list(namesdb.keys())[list(namesdb.values()).index(938237)])
    with open('resources/tiny.pickle', 'rb') as f: 
        tinydb = pickle.load(f)
        # print(tinydb)
        # print(namesdb['Kevin Bacon'])
    with open('resources/large.pickle', 'rb') as f:
        largedb = pickle.load(f)
    # print(transform_data(smalldb))
    # transform_data(smalldb)
    # additional code here will be run only when lab.py is invoked directly
    # (not when imported from test.py), so this is a good place to put code
    # used, for example, to generate the results for the online questions.
    print(namesdb)
    data_large = transform_data(largedb) 
    # data_tiny = transform_data(tinydb)
    # data_small = transform_data(smalldb)
    # print(acted_together(data_small, namesdb['Evan Glenn'], namesdb['Christian Campbell']))
    # print(acted_together(data_small, namesdb['Jean-Marc Roulot'], namesdb['Patrick Gorman']))
    # actors = actors_with_bacon_number(data_large, 6)
    # print(actors)
    # actors = [ list(namesdb.keys())[list(namesdb.values()).index(x)] for x in actors ]
    # print(actors)
    # bacon_path_1640 = bacon_path(data_tiny, 1640)
    # print(bacon_path_1640)
    # anita_id = namesdb['Anita Barnes']
    # bacon_path_anita = bacon_path(data_large, anita_id)
    # bacon_path_anita = [ list(namesdb.keys())[list(namesdb.values()).index(x)] for x in bacon_path_anita ]
    # print(bacon_path_anita)
    # margie_id = namesdb['Margie Angus']
    # kate_id = namesdb['Kate Jennings Grant']
    # margie_kate_path = actor_to_actor_path(data_large, margie_id, kate_id)
    # margie_kate_path = [ list(namesdb.keys())[list(namesdb.values()).index(x)] for x in margie_kate_path ]
    # print(margie_kate_path)
    # with open('resources/movies.pickle', 'rb') as f:
    #     movie_namedb = pickle.load(f)
    # movie_data_large = transform_data_movies(largedb)
    # gary_id = namesdb['Gary Sinise']
    # iva_id = namesdb['Iva Ilakovac']
    # gary_iva_movie_path = actor_to_actor_movie_path(data_large, movie_data_large, gary_id, iva_id)
    # gary_iva_movie_path = [ list(movie_namedb.keys())[list(movie_namedb.values()).index(x)] for x in gary_iva_movie_path ]
    # print(gary_iva_movie_path)

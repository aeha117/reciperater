"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email

url_signer = URLSigner(session)
    
@action('index')
@action.uses(db, auth, auth.user, 'index.html')
def index():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        my_callback_url = URL('my_callback', signer=url_signer),
    )

################################# Controller functions for Comments and Replies #################################

@action('comments')
@action.uses(db, auth, auth.user, 'comments.html')
def comments():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        my_callback_url = URL('my_callback', signer=url_signer),
        get_name_url = URL('get_name', signer=url_signer),
        get_user_email_url = URL('get_user_email', signer=url_signer),

        # Comment URLS
        load_comments_url = URL('load_comments', signer=url_signer),
        add_comment_url = URL('add_comment', signer=url_signer),
        delete_comment_url = URL('delete_comment', signer=url_signer),
        edit_comment_url = URL('edit_comment', signer=url_signer),
        add_liker_url = URL('add_liker', signer=url_signer),
        remove_liker_url = URL('remove_liker', signer=url_signer),
        add_disliker_url = URL('add_disliker', signer=url_signer),
        remove_disliker_url = URL('remove_disliker', signer=url_signer),

        # Reply URLS
        load_replies_url = URL('load_replies', signer=url_signer),
        add_reply_url = URL('add_reply', signer=url_signer),
        delete_reply_url = URL('delete_reply', signer=url_signer),
        edit_reply_url = URL('edit_reply', signer=url_signer),
    )

# Gets the user's name
@action('get_name')
@action.uses(url_signer.verify(), db)
def get_name():
    r = db(db.auth_user.email == get_user_email()).select().first()
    name = r.first_name + " " + r.last_name if r is not None else "Unknown"
    return dict(name=name)

# Gets the user's email
@action('get_user_email')
@action.uses(url_signer.verify(), db)
def get_user_email_handler():
    user_email = get_user_email()
    return dict(user_email=user_email)

# Loads the comments from the database.
# Used when the app initially opens.
@action('load_comments')
@action.uses(url_signer.verify(), db)
def load_comments():
    comment_rows = db(db.comments).select().as_list()
    return dict(comment_rows=comment_rows)

# Loads the replies from the database.
# Used when the app initially opens.
@action('load_replies')
@action.uses(url_signer.verify(), db)
def load_replies():
    reply_rows = db(db.replies).select().as_list()
    return dict(reply_rows=reply_rows)

# Adds a user's comment to the database.
@action('add_comment', method="POST")
@action.uses(url_signer.verify(), db)
def add_comment():
    id = db.comments.insert(
        comment_content=request.json.get('comment_content'),
        name=request.json.get('name'),
        likers=[],
        dislikers=[],
    )
    return dict(id=id)

# Adds a user's reply to the database.
@action('add_reply', method="POST")
@action.uses(url_signer.verify(), db)
def add_reply():
    id = db.replies.insert(
        comment_id=request.json.get('comment_id'),
        reply_content=request.json.get('reply_content'),
        name=request.json.get('name'),
    )
    return dict(id=id)

# Deletes a user's comment from the database.
@action('delete_comment')
@action.uses(url_signer.verify(), db)
def delete_comment():
    id = request.params.get('id')
    assert id is not None
    db(db.comments.id == id).delete()
    return "ok"

# Deletes a user's reply to a comment, from the database.
@action('delete_reply')
@action.uses(url_signer.verify(), db)
def delete_reply():
    id = request.params.get('id')
    assert id is not None
    db(db.replies.id == id).delete()
    return "ok"

# Edits a user's comment in the database.
@action('edit_comment')
@action.uses(url_signer.verify(), db)
def edit_comment():
    id = request.params.get('id')
    assert id is not None
    new_comment = request.params.get('new_comment')
    assert new_comment is not None
    db(db.comments.id == id).update(comment_content=new_comment)
    return "ok"

# Edits a user's reply in the database.
@action('edit_reply')
@action.uses(url_signer.verify(), db)
def edit_reply():
    id = request.params.get('id')
    assert id is not None
    new_reply = request.params.get('new_reply')
    assert new_reply is not None
    db(db.replies.id == id).update(reply_content=new_reply)
    return "ok"

# Adds a liker to a comment's list of likers.
# This is used to keep track of who liked which comment.
@action('add_liker')
@action.uses(url_signer.verify(), db)
def add_liker():
    id = request.params.get('id')
    assert id is not None
    user_email = get_user_email()
    row = db(db.comments.id == id).select().as_list()
    likers=row[0]["likers"]
    if user_email not in likers:
        likers.append(user_email)
    db(db.comments.id == id).update(likers=likers)

# Remove a liker from a comment's list of likers.
# This is used if the user unliked a comment, or disliked it.
@action('remove_liker')
@action.uses(url_signer.verify(), db)
def remove_liker():
    id = request.params.get('id')
    assert id is not None
    user_email = get_user_email()
    row = db(db.comments.id == id).select().as_list()
    likers=row[0]["likers"]
    if user_email in likers:
        likers.remove(user_email)
    db(db.comments.id == id).update(likers=likers)

# Adds a disliker to a comment's list of dislikers.
# This is used to keep track of who disliked which comment.
@action('add_disliker')
@action.uses(url_signer.verify(), db)
def add_disliker():
    id = request.params.get('id')
    assert id is not None
    user_email = get_user_email()
    row = db(db.comments.id == id).select().as_list()
    dislikers = row[0]["dislikers"]
    if user_email not in dislikers:
        dislikers.append(user_email)
    db(db.comments.id == id).update(dislikers=dislikers)

# Remove a disliker from a comment's list of dislikers.
# This is used if the user undisliked a comment, or liked it.
@action('remove_disliker')
@action.uses(url_signer.verify(), db)
def remove_disliker():
    id = request.params.get('id')
    assert id is not None
    user_email = get_user_email()
    row = db(db.comments.id == id).select().as_list()
    dislikers = row[0]["dislikers"]
    if user_email in dislikers:
        dislikers.remove(user_email)
    db(db.comments.id == id).update(dislikers=dislikers)

#################################### End of Comments and Replies Controllers  ####################################

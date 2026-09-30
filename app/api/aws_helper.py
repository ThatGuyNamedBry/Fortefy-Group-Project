import boto3
import botocore
import os
import re
import uuid
from flask import current_app

BUCKET_NAME = os.environ.get("S3_BUCKET")
# https, or a browser on the https site blocks the <audio> request as mixed
# content
S3_LOCATION = f"https://{BUCKET_NAME}.s3.amazonaws.com/"
# What get_unique_filename names an upload: 32 hex characters and an extension
UPLOADED_KEY = re.compile(r"[0-9a-f]{32}\.[a-z0-9]+")

s3 = boto3.client(
   "s3",
   aws_access_key_id=os.environ.get("S3_KEY"),
   aws_secret_access_key=os.environ.get("S3_SECRET")
)


def get_unique_filename(filename):
    ext = filename.rsplit(".", 1)[1].lower()
    unique_filename = uuid.uuid4().hex
    return f"{unique_filename}.{ext}"

def upload_file_to_s3(file, acl="public-read"):
    try:
        s3.upload_fileobj(
            file,
            BUCKET_NAME,
            file.filename,
            ExtraArgs={
                "ACL": acl,
                "ContentType": file.content_type
            }
        )
    except Exception as e:
        # in case the your s3 upload fails
        return {"errors": str(e)}

    return {"url": f"{S3_LOCATION}{file.filename}"}

def uploaded_key(url):
    """
    The S3 key of a file upload_file_to_s3 stored, or None for any other URL.

    Only those files are ours to delete. Seeded songs point at shared audio
    under prefixes like free/<artist>/<album>/, which every fresh seed relies
    on, so deleting a seeded song must leave its file alone.
    """
    if not url or not url.startswith(S3_LOCATION):
        return None
    key = url[len(S3_LOCATION):]
    return key if UPLOADED_KEY.fullmatch(key) else None


def remove_file_from_s3(song_url):
    """
    Delete an uploaded song's file. Call it after the song's row is gone, so a
    failure can only ever leave an unused file behind, never a song whose file
    is missing. A failure is logged with the key, so the file can be cleaned
    up by hand.
    """
    key = uploaded_key(song_url)
    if key is None:
        return

    try:
        s3.delete_object(Bucket=BUCKET_NAME, Key=key)
    except Exception as e:
        current_app.logger.error(
            'Could not delete %s from S3, it is now orphaned: %s', key, e)

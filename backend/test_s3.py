import os
import boto3
import botocore
from dotenv import load_dotenv

load_dotenv()
import requests
from botocore.client import Config

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"].strip(),
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"].strip(),
    region_name="eu-north-1",
    config=Config(signature_version="s3v4"),
)

bucket = "godsplan-creatorai"

key = "creatorai/6ac0f622f2ba140b1d4bb0fa/6ac0f94251138770f7073b03/Restaurant - Google Chrome 2025-01-18 01-38-25.mp4"

# First: verify that the object itself is accessible
print("\n--- HEAD OBJECT ---")

try:
    response = s3.head_object(
        Bucket=bucket,
        Key=key
    )

    print("SUCCESS")
    print("Size:", response["ContentLength"])
    print("ETag:", response["ETag"])

except Exception as e:
    print("HEAD OBJECT FAILED:")
    print(repr(e))


# Second: generate presigned URL
print("\n--- PRESIGNED URL ---")

url = s3.generate_presigned_url(
    ClientMethod="get_object",
    Params={
        "Bucket": bucket,
        "Key": key,
    },
    ExpiresIn=3600,
)

print(url)


# Third: directly request that URL from Python
print("\n--- DIRECT HTTP REQUEST ---")

try:
    r = requests.get(
        url,
        stream=True,
        timeout=30
    )

    print("HTTP STATUS:", r.status_code)
    print("CONTENT TYPE:", r.headers.get("Content-Type"))
    print("CONTENT LENGTH:", r.headers.get("Content-Length"))

    if r.status_code != 200:
        print("\nRESPONSE:")
        print(r.text[:3000])

except Exception as e:
    print("REQUEST FAILED:")
    print(repr(e))
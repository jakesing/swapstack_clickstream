import {
  ListObjectsCommand,
  ListObjectsCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
} from "@aws-sdk/client-s3";

import { s3Client } from "../config/aws";

export const getFilePaths = async ({
  bucket,
  marker,
  prefix,
  existingPaths,
}: {
  bucket: string;
  marker?: string;
  prefix?: string;
  existingPaths?: string[];
}): Promise<string[]> => {
  try {
    const params: ListObjectsCommandInput = {
      Bucket: bucket,
    };
    if (marker) params.Marker = marker;
    if (prefix) params.Prefix = prefix;

    const command = new ListObjectsCommand(params);
    const data = await s3Client.send(command);

    const paths: string[] = data.Contents.map((row) => row.Key);

    if (existingPaths?.length) existingPaths.concat(paths);
    else existingPaths = paths;

    if (data.IsTruncated) {
      const length = data.Contents.length;
      const marker = data.Contents[length - 1].Key;
      return getFilePaths({ bucket, marker, existingPaths });
    }

    return existingPaths;
  } catch (error) {
    throw error;
  }
};

export const getObject = async (bucket: string, path: string): Promise<GetObjectCommandOutput> => {
  try {
    const params: GetObjectCommandInput = {
      Bucket: bucket,
      Key: path,
    };

    const command: GetObjectCommand = new GetObjectCommand(params);
    const data = await s3Client.send(command);

    return data;
  } catch (error) {
    throw error;
  }
};

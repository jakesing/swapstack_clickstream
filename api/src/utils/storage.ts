import {
  ListObjectsV2CommandInput,
  ListObjectsV2Command,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
} from "@aws-sdk/client-s3";

import { s3Client } from "../config/aws";

export const getFilePaths = async ({
  bucket,
  prefix,
}: {
  bucket: string;
  prefix?: string;
}): Promise<string[]> => {
  try {
    const params: ListObjectsV2CommandInput = {
      Bucket: bucket,
    };
    if (prefix) params.Prefix = prefix;

    let isTruncated = true;
    let paths: string[] = [];

    let command = new ListObjectsV2Command(params);

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(command);
      paths.push(...Contents.map((row) => row.Key));
      isTruncated = IsTruncated;
      command.input.ContinuationToken = NextContinuationToken;
    }

    return paths;
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

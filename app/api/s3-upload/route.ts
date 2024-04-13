import { STSClient, GetFederationTokenCommand, STSClientConfig } from "@aws-sdk/client-sts";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getConfig, S3Config } from "@/lib/s3-config";
import { getClient } from "@/lib/s3-client";
import { sanitizeKey, uuid } from "@/lib/s3-keys";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

type NextRouteHandler = (req: NextRequest) => Promise<NextResponse>;

type Handler = NextRouteHandler & { configure: Configure };
type Configure = (options: Options) => Handler;

type Options = S3Config & {
    key?: (req: NextRequest, filename: string) => string | Promise<string>;
};

let missingEnvs = (config: Record<string, any>): string[] => {
    let required = ["accessKeyId", "secretAccessKey", "bucket", "region"];

    return required.filter((key) => !config[key] || config.key === "");
};

export async function POST(req: NextRequest) {
    let config = getConfig({});

    const session = await auth()
    if (!session) {
        console.log('Not authenticated');
        return NextResponse.json({}, { status: 401 });
    }

    let missing = missingEnvs(config);
    if (missing.length > 0) {
        console.log(`Next S3 Upload: Missing ENVs ${missing.join(", ")}`)
        return NextResponse.json({
            error: `Next S3 Upload: Missing ENVs ${missing.join(", ")}`
        }, { status: 500 })
    }
    const req_json = await req.json()
    let uploadType = req_json._nextS3?.strategy;
    let filename = req_json.filename;

    if (!filename) {
        console.log("Filename is empty!")
        return NextResponse.json({
            error: "Filename is empty!"
        }, { status: 500 });
    }

    let key = `next-s3-uploads/${sanitizeKey(filename)}`;
    let { bucket, region, endpoint } = config;

    if (uploadType === "presigned") {
        let filetype = req_json.filetype;
        let client = getClient(config);
        let params = {
            Bucket: bucket,
            Key: key,
            ContentType: filetype,
            CacheControl: "max-age=630720000",
        };

        console.log('getSignedUrl params:', params)
        const url = await getSignedUrl(
            client,
            new PutObjectCommand(params), {
                expiresIn: 60 * 60,
            }
        );

        return NextResponse.json({
            key,
            bucket,
            region,
            endpoint,
            url,
        }, { status: 200 });
    } else {
        console.log('uploadType:', uploadType);
        let stsConfig: STSClientConfig = {
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            region,
        };

        let policy = {
            Statement: [
                {
                    Sid: "Stmt1S3UploadAssets",
                    Effect: "Allow",
                    Action: ["s3:PutObject"],
                    Resource: [`arn:aws:s3:::${bucket}/${key}`],
                },
            ],
        };
        console.log('Resource:', `arn:aws:s3:::${bucket}/${key}`);

        let sts = new STSClient(stsConfig);

        console.log('S3UploadWebToken:', policy);
        let command = new GetFederationTokenCommand({
            Name: "S3UploadWebToken",
            Policy: JSON.stringify(policy),
            DurationSeconds: 60 * 60, // 1 hour
        });

        let token = await sts.send(command);
        console.log('Upload token:', token);
        const return_data = {
            token,
            key,
            bucket,
            region,
        };
        console.log('return_data:', return_data);

        return NextResponse.json(return_data, { status: 200 });
    }
};

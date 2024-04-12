import { STSClient, GetFederationTokenCommand, STSClientConfig } from "@aws-sdk/client-sts";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getConfig, S3Config } from "@/lib/s3-config";
import { getClient } from "@/lib/s3-client";
import { sanitizeKey, uuid } from "@/lib/s3-keys";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

type NextRouteHandler = (req: NextRequest, res: NextResponse) => Promise<void>;

type Configure = (options: Options) => Handler;
type Handler = NextRouteHandler & { configure: Configure };

type Options = S3Config & {
    key?: (req: NextRequest, filename: string) => string | Promise<string>;
};

let missingEnvs = (config: Record<string, any>): string[] => {
    let required = ["accessKeyId", "secretAccessKey", "bucket", "region"];

    return required.filter((key) => !config[key] || config.key === "");
};

let makeRouteHandler = (options: Options = {}): Handler => {
    let route: NextRouteHandler = async function (req: NextRequest, res: NextResponse): Promise<void> {
        let config = getConfig({
            accessKeyId: options.accessKeyId,
            secretAccessKey: options.secretAccessKey,
            bucket: options.bucket,
            region: options.region,
            forcePathStyle: options.forcePathStyle,
            endpoint: options.endpoint,
        });

        const session = await auth()
        if (!session) {
            console.log('Not authenticated');
            res = NextResponse.json({}, { status: 401 });
            return
        }

        let missing = missingEnvs(config);
        if (missing.length > 0) {
            console.log(`Next S3 Upload: Missing ENVs ${missing.join(", ")}`)
            res = NextResponse.json({
                error: `Next S3 Upload: Missing ENVs ${missing.join(", ")}`
            }, { status: 500 })
            return
        }
        const req_json = await req.json()
        let uploadType = req_json._nextS3?.strategy;
        let filename = req_json.filename;

        if (!filename) {
            console.log("Filename is empty!")
            res = NextResponse.json({
                error: "Filename is empty!"
            }, { status: 500 });
            return
        }

        let key = options.key
            ? await Promise.resolve(options.key(req_json, filename))
            : `next-s3-uploads/${uuid()}/${sanitizeKey(filename)}`;
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

            res = NextResponse.json({
                key,
                bucket,
                region,
                endpoint,
                url,
            }, { status: 200 });
            return;
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

            res = NextResponse.json({
                token,
                key,
                bucket,
                region,
            }, { status: 200 });
            return;
        }
    };

    let configure = (options: Options) => makeRouteHandler(options);

    return Object.assign(route, { configure });
};

let APIRoute = makeRouteHandler();

export { APIRoute as POST, APIRoute as GET };

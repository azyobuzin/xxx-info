import { credentials, type OAuth2Client } from "@grpc/grpc-js";
import { httpInstrumentationMiddleware } from "@hono/otel";
import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import {
  defaultResource,
  detectResources,
  envDetector,
  type Resource,
  resourceFromAttributes,
} from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  ConsoleSpanExporter,
  type SpanExporter,
} from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import type { MiddlewareHandler } from "hono";
import { googleAuth } from "./google-auth-singleton.ts";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

let traceExporter: SpanExporter | undefined;

/** OpenTelemetryでトレースの取得を開始します。 */
export async function start(): Promise<void> {
  if (traceExporter) {
    return;
  }

  try {
    // Google Cloud Telemetryへの送信を試みる
    // ref: https://github.com/GoogleCloudPlatform/opentelemetry-operations-js/blob/a2e3e0dc713bd485c0371bcce749c06d9aa284ad/samples/otlptraceexport/src/app-grpc-export.ts
    traceExporter = await createGoogleCloudTraceExporter();
  } catch (error) {
    console.error("Failed to authenticate with Google Cloud:", error);

    // 認証に失敗した場合は、コンソールへの出力にフォールバックする
    traceExporter = new ConsoleSpanExporter();
  }

  const sdk = new NodeSDK({
    autoDetectResources: false,
    resource: await createResource(),
    metricReaders: [],
    instrumentations: [new UndiciInstrumentation()],
    traceExporter: traceExporter,
  });

  sdk.start();
}

async function createGoogleCloudTraceExporter(): Promise<SpanExporter> {
  // HACK: google-auth-library v10だとcreateFromGoogleCredentialとの互換性がないので、差を吸収するオブジェクトを作る
  const client: OAuth2Client = {
    async getRequestHeaders(url?: string): Promise<Record<string, string>> {
      const headers = await googleAuth.getRequestHeaders(url);
      return Object.fromEntries(headers.entries());
    },
  };

  return new OTLPTraceExporter({
    url: "https://telemetry.googleapis.com",
    credentials: credentials.combineChannelCredentials(
      credentials.createSsl(),
      credentials.createFromGoogleCredential(client),
    ),
  });
}

/** 環境情報を取得する。 */
async function createResource(): Promise<Resource> {
  const env = process.env.NODE_ENV || "development";
  const baseResource = defaultResource()
    .merge(
      resourceFromAttributes({
        [ATTR_SERVICE_NAME]: `xxx-info-api-${env}`,
      }),
    )
    // 環境変数で上書きできるようにする
    .merge(detectResources({ detectors: [envDetector] }));

  try {
    const projectId = await googleAuth.getProjectId();
    return baseResource.merge(
      resourceFromAttributes({
        // GCPに送信するには必須項目
        "gcp.project_id": projectId,
      }),
    );
  } catch (error) {
    console.error("Failed to get project ID from Google Auth:", error);
  }

  return baseResource;
}

/** Hono向けミドルウェアを作成します。 */
export function createMiddleware(): MiddlewareHandler {
  const instrumentationConfig = {
    captureRequestHeaders: ["user-agent"],
  };
  const instrumentationMiddleware = httpInstrumentationMiddleware(
    instrumentationConfig,
  );

  return async (c, next) => {
    try {
      return await instrumentationMiddleware(c, next);
    } finally {
      // Cloud Runでの実行を想定して、1リクエストごとにトレースデータを送信する
      try {
        await traceExporter?.forceFlush?.();
      } catch (error) {
        console.error("Failed to flush trace data:", error);
      }
    }
  };
}

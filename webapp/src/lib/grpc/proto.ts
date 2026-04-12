import path from "node:path";

import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const cwd = process.cwd();
const protoPath = cwd.endsWith(`${path.sep}webapp`)
  ? path.resolve(cwd, "..", "src", "proto", "openclaude.proto")
  : path.resolve(cwd, "src", "proto", "openclaude.proto");

const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

export const openclaudeProto = grpc.loadPackageDefinition(packageDefinition) as any;

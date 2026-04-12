import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'

const PROTO_PATH = path.resolve(import.meta.dirname, '../src/proto/openclaude.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any
const openclaudeProto = protoDescriptor.openclaude.v1

function emit(payload: unknown) {
  console.log(JSON.stringify(payload))
}

function parseRequest() {
  const raw = process.env.TUTOR_GRPC_REQUEST_JSON
  if (!raw) {
    throw new Error('Missing TUTOR_GRPC_REQUEST_JSON')
  }

  const parsed = JSON.parse(raw)
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    typeof parsed.message !== 'string' ||
    typeof parsed.sessionId !== 'string' ||
    typeof parsed.workingDirectory !== 'string'
  ) {
    throw new Error('Invalid tutor gRPC request payload')
  }

  return {
    message: parsed.message,
    sessionId: parsed.sessionId,
    workingDirectory: parsed.workingDirectory,
    model:
      typeof parsed.model === 'string' && parsed.model.trim().length > 0
        ? parsed.model
        : undefined,
  }
}

async function main() {
  const request = parseRequest()
  const host = process.env.GRPC_HOST || 'localhost'
  const port = process.env.GRPC_PORT || '50051'
  const client = new openclaudeProto.AgentService(
    `${host}:${port}`,
    grpc.credentials.createInsecure(),
  )

  await new Promise<void>((resolve, reject) => {
    client.waitForReady(Date.now() + 30_000, (error: Error | null) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })

  const call: grpc.ClientDuplexStream<any, any> = client.Chat()
  let finished = false

  const finalize = (exitCode: number) => {
    if (finished) {
      return
    }
    finished = true
    try {
      call.end()
    } catch {
      // ignore shutdown races
    }
    client.close()
    process.exitCode = exitCode
  }

  call.on('data', (serverMessage: any) => {
    emit({ serverMessage })

    if (serverMessage.action_required?.prompt_id) {
      call.write({
        input: {
          prompt_id: serverMessage.action_required.prompt_id,
          reply: 'y',
        },
      })
      return
    }

    if (serverMessage.done) {
      finalize(0)
    } else if (serverMessage.error) {
      finalize(1)
    }
  })

  call.on('error', (error: Error) => {
    emit({ error: error.message })
    finalize(1)
  })

  call.on('end', () => {
    finalize(0)
  })

  call.write({
    request: {
      message: request.message,
      session_id: request.sessionId,
      working_directory: request.workingDirectory,
      model: request.model,
    },
  })
}

main().catch((error) => {
  emit({ error: error instanceof Error ? error.message : String(error) })
  process.exitCode = 1
})

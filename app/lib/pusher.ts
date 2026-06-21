import Pusher from 'pusher';

const appId = process.env.PUSHER_APP_ID;
const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

// Initialize Pusher Server client only if keys are present
export const pusherServer =
  appId && key && secret && cluster
    ? new Pusher({
        appId,
        key,
        secret,
        cluster,
        useTLS: true,
      })
    : null;

/**
 * Safely trigger a Pusher event. Falls back gracefully with a warning
 * if Pusher environment variables are not configured.
 */
export async function triggerEvent(channel: string, event: string, data: any) {
  if (pusherServer) {
    try {
      await pusherServer.trigger(channel, event, data);
    } catch (error) {
      console.error(`Pusher trigger error on channel '${channel}':`, error);
    }
  } else {
    console.warn(
      `Pusher keys not configured. Real-time event '${event}' on channel '${channel}' was skipped.`
    );
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import { ClientConfig, Client, WebhookEvent, TextMessage, MessageAPIResponseBase } from '@line/bot-sdk';

const clientConfig: ClientConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new Client(clientConfig);

const textEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }
  const { replyToken } = event;
  const { text } = event.message;
  const response: TextMessage = {
    type: 'text',
    text: 'return : ' + text
  };
  await client.replyMessage(replyToken, response);
}

const followEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {
  if (event.type !== 'follow') {
    return;
  }
  const userId = event.source.userId
  const { replyToken } = event;
  const response: TextMessage = {
    type: 'text',
    text: 'welcome'
  };
  await client.replyMessage(replyToken, response);
}

const unFollowEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {
  if (event.type !== 'unfollow') {
    return;
  }
  const userId = event.source.userId
  console.log('unfollow userID: ',userId)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return res.status(405).json({
      status: 'error',
      message: 'Method Not Allowed'
    });
  }

  const events: WebhookEvent[] = req.body.events;

  if (events===undefined) {
    return res.status(200).json({
      status: 'success'
    });
  }

  const results = await Promise.all(
    events.map(async (event: WebhookEvent) => {
      console.log('event.type: ',event.type)
      if (event.type === 'message' && event.message.type === 'text') {
        try {
          await textEventHandler(event);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err);
          }
        }
      }else if (event.type === 'follow') {
        try {
          await followEventHandler(event);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err);
          }
        }
      }else if (event.type === 'unfollow') {
        try {
          await unFollowEventHandler(event);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err);
          }
        }
      }
    })
  );

  return res.status(200).json({
    status: 'success',
    results,
  });
}
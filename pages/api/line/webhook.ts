import { NextApiRequest, NextApiResponse } from "next";
import { ClientConfig, Client, WebhookEvent, TextMessage, MessageAPIResponseBase } from '@line/bot-sdk';

const clientConfig: ClientConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new Client(clientConfig);

const textEventHandler = async (event: object) => {
  const message = event.message.text
  const response: TextMessage = {
    type: 'text',
    text: 'return : ' + message
  };
  const replyToken = event.replyToken
  await client.replyMessage(replyToken, response);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const events: WebhookEvent[] = req.body.events;

  if (events===undefined) {
    return res.status(200).json({
      status: 'success'
    });
  }

  const results = await Promise.all(
    events.map(async (event: WebhookEvent) => {
      if (event.type === 'message' && event.message.type === 'text') {
        try {
          await textEventHandler(event);
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
import { NextApiRequest, NextApiResponse } from "next";
import { ClientConfig, Client, WebhookEvent, TextMessage, MessageAPIResponseBase } from '@line/bot-sdk';

const clientConfig: ClientConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new Client(clientConfig);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.body.events && req.body.events.length === 0) {
    res.status(200).json({
      status: 'success'
    })
    return;
  }

  const replyToken = req.body.events[0].replyToken

  const response: TextMessage = {
    type: 'text',
    text: 'test'
  };

  // Reply to the user.
  await client.replyMessage(replyToken, response);

  // client.broadcast({
  //   type: "text",
  //   text: 'test'
  // })
  // .then(data => console.log(data))
  // .catch(e => console.log(e))

  res.status(200).json({})
}
import { Inject, Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  constructor(@Inject('TRANSACTION_SERVICE') private client: ClientRMQ) {}

  // constructor(private readonly rmqService: RMQService) {}

  async send(pattenn: any, txData: any): Promise<any> {
    try {
      const bb = this.client.emit('abc', txData);
      console.log(bb);

    } catch (e) {
      console.log(e);
    }

    return 'Asdasd';
  }

  async get(): Promise<any> {
    try {
      const connect = this.client.createClient();
      const channel = connect.createChannel();

      await channel.consume(
        'tx_queue',
        (msg) => {
          console.log(msg.content.toString());
        },
        { noAck: true },
      );

      return 'Asd';
    } catch (e) {
      console.log(e);
    }
  }
}

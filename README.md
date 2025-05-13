# Run redis-ws server

```
 git clone https://github.com/leander006/redis-ws.git
 cd redis-ws
 docker-compose up
```
# To see Kafka messages
 ```
 docker ps
 docker exec -it container_id /bin/bash
 cd /opt/kafka/bin
 ./kafka-console-consumer.sh --topic MESSAGES --from-beginning --bootstrap-server localhost:9092
```
Select container_id of apache/kafka:latest contianer

# To view prisma data
```
cd redis-ws
npx prisma studio 
```
# Testing using Postman
- open postman 
- Select websocket service
- Use ws://localhost:8081?userId=
![image](https://github.com/user-attachments/assets/fdf2d302-c454-4ecf-8728-8dd9a79ff984)

Similarly connect in second websocket postman window

- Make Get call to get information about existing users
```
http://localhost:3002/api/users
```
![image](https://github.com/user-attachments/assets/c14b0cea-d5fa-412d-9546-7d8e627f7050)

- Make Get call to get information about existing rooms to get room Id
```
http://localhost:3002/api/rooms
```
![image](https://github.com/user-attachments/assets/5af434ca-40b1-4d55-b897-7667dbca15e1)
- Copy first room Id and make api call to get information about existing messages in that rooms
```
http://localhost:3002/api/rooms/roomId
```
![image](https://github.com/user-attachments/assets/425e6393-d6b9-49e7-8c08-39c7a1222491)

- First subscribe to one room
```
{
    "type":"subscribe",
    "roomId":"roomId"
}
```
- Make sure second person is also subscribed to same rooms else he will not receive messages  
![image](https://github.com/user-attachments/assets/74c466a4-a656-4487-9741-ec9dd209113e)

- Then start sending messages
```
{
    "type":"sendMessage",
    "roomId":"roomId",
    "message":"Hey bro is it working?yyayayayaya"
}
```
![image](https://github.com/user-attachments/assets/ddc4f993-3961-4858-8968-93e3464c0c25)

![image](https://github.com/user-attachments/assets/75fd822e-841e-4282-a702-e5c09c19f30d)


# Note 
- Always subscribe to room without that you can't see and receive message
- If server goes down reason can be json format parsed while sending messages so check it once
- Always use a valid userId else kafka will not be able to save data in db giving userId does not exist exception


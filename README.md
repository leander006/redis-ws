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
# Testing using Postman
- open postman 
- Select websocket service
- Use ws://localhost:8080 url
- First subscribe to one room 
```
{
    "type":"subscribe",
    "roomId":"3"
}
```
- Then start sending messages
```
{
    "type":"sendMessage",
    "roomId":"3",
  	 "message":"Hello i am from second server"
}
```
# Note 
- Always subscribe to room without that you can't see and receive message
- If server goes down reason can be json format parsed while sending messages so check it once 


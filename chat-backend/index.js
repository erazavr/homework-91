const express = require('express');
const cors = require("cors");
const expressWs = require('express-ws');
const mongoose = require('mongoose');
const {nanoid} = require('nanoid');


const app = express();
const port = 8000;

const User = require('./models/User');
const Message = require('./models/Message');
const users = require('./app/users');
const messages = require('./app/messages');

expressWs(app);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const connections = {};

const run = async () => {
    await mongoose.connect('mongodb://localhost/chat', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });

    app.use('/users', users);
    app.use('/messages', messages);

    app.ws('/chat', async (ws,req) => {
        console.log('Client connected');

        const id = nanoid();
        const token = req.query.token;
        const user = await User.findOne({token});
        if (!token || !user) {
            return ws.close()
        }
        connections[id] = {user, ws};
        const result = await Message.find();
        console.log('total clients connected: ' + Object.keys(connections).length);

        const userNames = Object.keys(connections).map(connId => {
            const connection = connections[connId];
            return connection.user.username
        });

        ws.send(JSON.stringify({
            type: 'LAST_MESSAGES',
            messages: result.slice(-30)
        }));
        ws.send(JSON.stringify({
            type: 'ONLINE_USERS',
            users: userNames
        }));

        ws.on('message', async msg => {
            const parsed = JSON.parse(msg);
            switch (parsed.type) {
                case 'CREATE_MESSAGE':
                    const newMessage = {
                        message: parsed.message,
                        user: user.username
                    };
                    const message = new Message(newMessage);
                    await message.save();
                    Object.keys(connections).forEach(connId => {
                        const connection = connections[connId];
                        connection.ws.send(JSON.stringify({
                            type: 'NEW_MESSAGE',
                            message
                        }));
                    });
                    break;
                default:
                    console.log('No type', parsed.type)
            }
        });

        ws.on('close', (msg) => {
            console.log(`client disconnected! ${id}`);

            delete connections[id];
        });

    });

    app.listen(port, () => {
        console.log(`HTTP Server started on ${port} port!`);
    });
};

run().catch(e => {
    console.error(e);
});
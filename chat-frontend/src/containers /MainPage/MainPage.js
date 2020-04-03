import React, {Component} from 'react';
import {connect} from "react-redux";
import ReconnectingWebSocket from "reconnecting-websocket";
import {
    Button,
    Card,
    CardBody,
    CardSubtitle,
    CardText,
    CardTitle,
    Col,
    Container,
    Form,
    FormGroup, Input,
    Row
} from "reactstrap";

class MainPage extends Component {
    state = {
        message: '',
        messages: [],
        onlineUsers: []
    };
    componentDidMount() {
        if(this.props.user) {
            this.websocket = new ReconnectingWebSocket('ws://localhost:8000/chat?token=' + this.props.user.token, null ,{debug :  true , reconnectInterval :  3000 });
        } else {
            this.websocket = new ReconnectingWebSocket('ws://localhost:8000/chat', null, {debug :  true , reconnectInterval :  3000 });
        }


        this.websocket.onmessage = (message => {
            try {
                const data = JSON.parse(message.data);
                switch (data.type) {
                    case "NEW_MESSAGE":
                        this.setState({messages: [...this.state.messages, data.message]});
                    break;
                    case "LAST_MESSAGES":
                        this.setState({messages: data.messages});
                    break;
                    case "ONLINE_USERS":
                        this.setState({onlineUsers: data.users})
                }
            } catch (e) {
                console.log('Something went wrong', e)
            }
        })
    }
    submitForm = e => {
        e.preventDefault();
        if (!this.state.message) {
            alert('Вы ничего не ввели')
        } else {
            const message = {
                type: 'CREATE_MESSAGE',
                message: this.state.message,
            };
            this.setState({message: ''})
            this.websocket.send(JSON.stringify(message));
        }

    };
    changeMessage = e => this.setState({message: e.target.value});

    render() {
        return (
            <>
                {this.props.user ?
                    <Row>
                        <Col sm={4}>
                            <div className="clearfix" style={{width: '900px'}}>
                                <Card className='float-left'>
                                    <CardBody >
                                        <CardTitle><b>Online users</b></CardTitle>
                                        {this.state.onlineUsers && this.state.onlineUsers.map((user,i) => (
                                            <div key={i}>
                                                <CardSubtitle>{user}</CardSubtitle>
                                            </div>
                                        ))}

                                    </CardBody>
                                </Card>
                                <Card className='float-right mb-3' style={{width: '751px'}}>
                                    <CardBody >
                                        <CardTitle><b>Chat room</b></CardTitle>

                                        {this.state.messages[0] ? this.state.messages.map((msg) => (
                                            <div key={msg._id}>
                                                <CardSubtitle><b>{msg.user}</b>: {msg.message}</CardSubtitle>
                                            </div>
                                        )): <p>Сообщений нет</p>}
                                    </CardBody>
                                </Card>
                                <Form inline className='position-fixed' onSubmit={this.submitForm} style={{right: '0'}}>
                                    <FormGroup >
                                            <Input
                                                style={{width: '270px'}}
                                                className='mr-3'
                                                onChange={this.changeMessage}
                                                value={this.state.message}
                                            />
                                    </FormGroup>
                                    <FormGroup >
                                            <Button color='primary' type='submit'>
                                                Send
                                            </Button>
                                    </FormGroup>
                                </Form>
                            </div>
                        </Col>
                    </Row>: <h1>Вы не залогинены</h1>
                }

            </>
        );
    }
}

const mapStateToProps = state => ({
    user: state.users.user
});

export default connect(mapStateToProps)(MainPage);
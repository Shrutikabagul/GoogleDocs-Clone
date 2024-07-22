import { useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Box } from '@mui/material';
import styled from '@emotion/styled';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

const Component = styled.div`
    background: #F5F5F5;
`;

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['clean'],
];

const Editor = () => {
    const [socket, setSocket] = useState(null);
    const [quill, setQuill] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const quillServer = new Quill('#container', { theme: 'snow', modules: { toolbar: toolbarOptions }});
        quillServer.disable();
        quillServer.setText('Loading the document...');
        setQuill(quillServer);
        console.log('Quill initialized');
    }, []);

    useEffect(() => {
        const socketServer = io('https://googledocs-clone-server.onrender.com');
        setSocket(socketServer);

        socketServer.on('connect', () => {
            console.log('Connected to server');
        });

        socketServer.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        socketServer.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        return () => {
            socketServer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket === null || quill === null) return;

        const handleChange = (delta, oldData, source) => {
            if (source !== 'user') return;
            console.log('Sending changes:', delta);
            socket.emit('send-changes', delta);
        };

        quill.on('text-change', handleChange);

        return () => {
            quill.off('text-change', handleChange);
        };
    }, [quill, socket]);

    useEffect(() => {
        if (socket === null || quill === null) return;

        const handleChange = (delta) => {
            console.log('Receiving changes:', delta);
            quill.updateContents(delta);
        };

        socket.on('receive-changes', handleChange);

        return () => {
            socket.off('receive-changes', handleChange);
        };
    }, [quill, socket]);

    useEffect(() => {
        if (quill === null || socket === null) return;

        socket.once('load-document', (document) => {
            console.log('Document loaded:', document);
            quill.setContents(document);
            quill.enable();
        });

        socket.emit('get-document', id);
    }, [quill, socket, id]);

    useEffect(() => {
        if (socket === null || quill === null) return;

        const interval = setInterval(() => {
            const contents = quill.getContents();
            console.log('Saving document:', contents);
            socket.emit('save-document', contents);
        }, 2000);

        return () => {
            clearInterval(interval);
        };
    }, [socket, quill]);

    return (
        <Component>
            <Box className='container' id='container'></Box>
        </Component>
    );
};

export default Editor;

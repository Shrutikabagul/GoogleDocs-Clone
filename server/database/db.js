import mongoose from 'mongoose';

const Connection = async (username = 'usercode', password = 'codeforinterview') => {
    const URL = `mongodb://${username}:${password}@ac-7k9gayx-shard-00-00.hj7gwje.mongodb.net:27017,ac-7k9gayx-shard-00-01.hj7gwje.mongodb.net:27017,ac-7k9gayx-shard-00-02.hj7gwje.mongodb.net:27017/?replicaSet=atlas-11u9b4-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=googledocsclone`;

    try {
        await mongoose.connect(URL);
        console.log('Database connected successfully');
    } catch (error) {   
        console.log('Error while connecting with the database ', error);
    }
}

export default Connection;

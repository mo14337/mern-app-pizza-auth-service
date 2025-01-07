import app from './app';
import { Config } from './config';

const PORT = Config.PORT;
// const startServer=()=>{
//     try {
//         app.listen(PORT,()=>{
//             console.log("Server is running on port",PORT);
//         })
//     } catch (error) {
//         console.error(error);
//        process.exit();
//     }
// }
// startServer()

app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});

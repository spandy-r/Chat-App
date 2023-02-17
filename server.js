const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

//
const path=require('path')

const multer=require('multer')

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images') 
    },
    filename:(req,file,cb)=>{
        console.log(file)
        cb(null,Date.now()+path.extname(file.originalname))
    }
})

const upload=multer({storage:storage})
//

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

const Message = mongoose.model('Message',{
  name : String,
  message : String
})

const dbUrl='mongodb+srv://Spandan123:Spandan123@traversymedia.q0eelck.mongodb.net/simple-chat'



app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})



app.post('/messages', async (req, res) => {
  try{
    const message = new Message(req.body);

    const savedMessage = await message.save()
      console.log('saved');

    const censored = await Message.findOne({message:'badword'});
      if(censored)
        await Message.remove({_id: censored.id})
      else
        io.emit('message', req.body);
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('error',error);
  }
  finally{
    console.log('Message Posted')
  }

})

//UPLOAD IMAGE

app.post('/',upload.single('image'), (req, res) => {
  
   
    res.sendFile(__dirname+"/index.html")

});


io.on('connection', () =>{
  console.log('connected')
})

mongoose.connect(dbUrl,(err) => {
   
  console.log('mongodb connected',err);
})

const server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});
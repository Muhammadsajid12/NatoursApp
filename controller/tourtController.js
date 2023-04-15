const fs = require('fs');

const tours =  JSON.parse( fs.readFileSync(`${__dirname}/tours-simple.json`)); // important is here no add space in url





// param Middleware..............

const CheckID =(req,res,next,val)=>{
console.log(`This is the id:${val}`);
if(req.params.id*1>tours.length){

res.status(404).json({msg:"Your Entered number is invalid"})

return ;
}

next();


}

const Auth = (req,res,next)=>{
    console.log("Here is the Auth function..........");
    if(!req.body.name || !req.body.price){

  res.status(400).json({
    status:"failed",
    Msg:"Missing name or Price.."
  })

    }

    next();
}

const GetTours=(req,res)=>{

console.log(req.Time);

res.status(200).json({
satus:'success',
  requesAt:req.Time,
results:tours.length,
data:{
    tours
}

})

}


const GetByIdTour=(req,res)=>{

 const id=req.params.id*1
console.log(id);


 const tour = tours.find(el => el.id===id) 


res.status(200).json({
    results:"success",
    tour
})

}

const PostTour=(req,res)=>{

const newId = tours [tours.length-1].id+1;
console.log( newId);

const newTour= Object.assign({id:newId}, req.body); // This obj.assign make a new obj with some extra added fields

tours.push(newTour)

fs.writeFile(`${__dirname}/tours-simple.json` ,JSON.stringify(tours),err=>{

if(err){
    res.send(`'file not written:${err}`)
}else{

res.status(201).json({
    status:"success",
    requesAt:req.Time,
    results: tours.length,
    data:{
        tours
    }
})

}

} )

}


const PatchTour=(req,res)=>{

 



res.status(200).json({
    results:"success",
    tour:"Data is updated...."
})

}


const DeleteTour = (req,res)=>{

const id=req.params.id*1
 


res.status(204).json({
    results:"success",
    tour:"Data is updated...."
})

}

module.exports={
    GetTours,
    GetByIdTour,
    PostTour,
    PatchTour,
    DeleteTour,
 CheckID ,
Auth 


}
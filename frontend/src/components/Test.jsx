import React from 'react'
import { updateContext } from '../context/updateContext';
import './css/Posts.css'
import {v4 as uuidv4} from 'uuid'
import {useState,useContext,useEffect} from '../context/updateContext'
import axios from 'axios'

export default function Test() {

    //create a post

// const [post,setPost] = useState(null)
    // const [updater,setUpdater] = useContext(updateContext)
    // const user = {_id: '123', username: 'thomas'}

    // const createPost = ()=>{
    // const postData = {
    //     userId: user._id,
    //     username: user.username,
    //     postId: uuidv4(),
    //     content: post


    //     }
    //     axios.post('/api/posts', postData)
    //     setPost('')
    //     setUpdater((state)=> state + 1)

    // }
    


    // return (
    //     <div>
    //         <div className="post__form">
    //         <input 
    //             type="text" 
    //             placeholder="Tell us what's on your mind..." 
    //             value={post}
    //             onChange={(e)=>{setPost(e.target.value)}}
    //             maxLength={140}
    //         />
    //         <div>
    //             <button onClick={createPost}>Send</button>
    //         </div>
    //     </div>
            
    //     </div>
    // )



    // handle delete, edit of the post data and also fetching data to to be rendered 

    const [posts,setPost] = useState(null)
    const [input,setInput] =  useState('')
    const [updater, setUpdater] = useContext(updateContext)
    const [editId,setEditId] = useState(null)

    const user = {_id: '123', username: 'thomas'}


    //function to fetch all posts from the api

    const fetchPosts =  async ()=>{
        const fetchData = await axios.get('api/posts')
        return fetchData


    }

    useEffect(() => {
        fetchPosts().then((postData) => {
            setPost(postData.data.reverse())
        })
    }, [updater])

    // funstion to handle deletion by Id

    const handleDelete = (id)=>{

        console.log(id)
        axios.post('/api/posts/delete', {id})
        setUpdater((state)=>state + 1)
    }

    // function for handling edited  data to be sent to the server

    const handleEdit = (id)=>{
        const postCollection = {
            userId: user._id,
            content: input
        }

        axios.put('/api/posts/edit'+id, postCollection)
        setInput('')
        setUpdater((state)=> state + 1)



    }


    return(
        <div className="posts_container" >
           {

               posts&&
               posts.map(post=>(
                   <div className="posts" key ={post.postId}>
                       <div className="post_details">
                           <img src="http://images.gov.com" alt=""/>
                           <h2>{post.username}</h2>
                           <p>{post.content}</p>




                           </div>
                           {
                               post.userId === user._id &&
                               <div className="btns">
                                   {

                                       editId !== post.postId ?

                                       <>
                                       <button onClick={()=>{
                                           setEditId(post.postId)
                                           setInput(post.content)
                                           
                                       }}  className="btn_edit">
                                           Edit

                                       </button>
                                       <button onClick={()=>handleDelete(post.postId)}>
                                           </button>




                                       </>
                                       :
                                       <>
                                       <input 
                                       type = 'text'
                                       placeholder="start modifying the post"
                                       value={input}
                                       onChange={(e)=>setInput(e.target.value)}
                                       
                                       />
                                       <button 
                                       onClick={()=>handleEdit(post.postId)}
                                       className="btn_save"
                                       
                                       
                                       >Save


                                       </button>
                                       <button  onClick={()=>
                                           setEditId(null)

                                       }>Cancel

                                       </button>
                                      
                                      </>
                                       
                                      

                                   }




                               </div>


                           }



                   </div>


               )



               )










           }










        </div>








    )
}

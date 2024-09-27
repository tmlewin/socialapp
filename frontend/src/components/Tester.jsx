import axios from '../axios';
import React, { useContext, useState,useEffect } from 'react'
import './css/PostForm.css'
import {v4 as uuidv4} from 'uuid';
import { updateContext } from '../context/updateContext';

function Tester() {
//     const [updater, setUpdater] = useContext(updateContext)
//     const user = {_id: '123', username: 'tannerkc'}
//     const [post, setPost] = useState('');

//     const handleSend = () =>{
//         const postData = {
//             userId: user._id,
//             user: user.username,
//             postId: uuidv4(),
//             content: post
//         }
//         axios.post('/api/posts', postData)
//         setPost('')
//         setUpdater((state)=>state + 1)
//     }
//   return (
//     <div className="postForm">
//         <input
//             type="text"
//             placeholder="Tell us what's on your mind..."
//             onChange={(e)=>setPost(e.target.value)}
//             value={post}
//             />
//         <div>
//             <button onClick={handleSend}>Send</button>
//             </div>


        
//     </div>
//   )



    const [updater, setUpdater] = useContext(updateContext)
    const user = {_id: '123', username: 'tannerkc'}
    const [posts, setPosts] = useState('');
    const [editId, setEditId] = useState(null);
    const [input, setInput] = useState('');
    
    // create a function to fetch all posts
    const postData = async () => {
        const data = await axios.get('/api/posts');
        return data
    }

    useEffect(() => {
        postData().then(posts => {
            setPosts(posts.data.reverse());
        }
        )
    }, [])

    // create function to delete posts
    const deletePost = async (id) => {
        await axios.post('/api/posts/delete', id);
        setUpdater((state)=>state + 1)
    }

    // create function to edit posts
    const handleSend = async (id) => {
        const data = {
            userId:user._id,
            content:input,
        }
        await axios.put('/api/posts/'+id, data);
        setInput('')
        setUpdater((state)=>state + 1)

    }




return(
    <div className ='form__Container'> 
    {
        posts&&
        posts.map(post => (
            <div className='post__Container' key={post.postid}>
                <div className='post__details'>
                    <img className='avatar' src='https://cdn.vox-cdn.com/thumbor/JgCPp2BBxETY596wCp50ccosCfE=/0x0:2370x1574/1200x800/filters:focal(996x598:1374x976)/cdn.vox-cdn.com/uploads/chorus_image/image/68870438/Screen_Shot_2020_07_21_at_9.38.25_AM.0.png' alt='' />
                    <div>
                        <h3>{post.user}</h3>
                        <p>{post.content}</p>
                    </div>
                </div>
                {
                    post.userId === user._id &&
                    <div className='post__buttons'>
                        editId === post.postid 
                        ?
                        <button className='btn btn-primary' onClick={()=>{
                            setEditId(post.postid)
                            setInput(post.content)
                            
                            }}>edit</button>
                            <button className='btn btn-primary' onClick={()=>{
                                deletePost(post.postid)
                            }}>delete</button>
                        :
                        <input type='text' 
                        value={post.content} 
                        onChange={(e)=>setInput(e.target.value)}

                        />
                        <button className='btn btn-primary' onClick={()=>{
                            handleSend(post.postid)
                        }
                        }>send</button>
                        <button className='btn btn-primary' onClick={()=>{
                            setEditId(null)
                        }
                        }>cancel</button>
                    </div>



                        
                }
            </div>


    )
    )
    }


      
      </div>


      
)





}


export default Tester
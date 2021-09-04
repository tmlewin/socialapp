import React, { useContext, useEffect, useState } from 'react'
import axios from '../axios';
import { updateContext } from '../context/updateContext';
import './css/Posts.css'

export default function Posts() {

    const [updater, setUpdater] = useContext(updateContext)
    const user = {_id: '123', username: 'tannerkc'}

    const [posts, setPosts] = useState(null)

    const [input, setInput] = useState('')
    const [editId, setEditId] = useState(null)

    const fetchPosts = async() =>{
        let postsData = await axios.get('/api/posts')
        return postsData
    }

    const handleDelete = async(id) =>{
        console.log(id)
        await axios.post('/api/posts/delete',{id})
        setUpdater(state => state + 1)
    }
    
    useEffect(()=>{
        console.log(updater)
        fetchPosts().then((posts)=>{
            setPosts(posts.data.reverse())
        })
    }, [updater])

    const handleSend = (id) =>{
        const postData = {
            userId: user._id,
            content: input
        }
        
        axios.put('/api/posts/'+id, postData)
        
        setInput('')
        setUpdater((state)=>state + 1)

        window.location.reload();
    }


    return (
        <div className="posts__container">
            {
                posts&&
                posts.map(post=>(
                    <div className="post" key={post.postId}>
                        <div className="post__details">
                            <img className="avatar" src="https://cdn.vox-cdn.com/thumbor/JgCPp2BBxETY596wCp50ccosCfE=/0x0:2370x1574/1200x800/filters:focal(996x598:1374x976)/cdn.vox-cdn.com/uploads/chorus_image/image/68870438/Screen_Shot_2020_07_21_at_9.38.25_AM.0.png" alt="" />
                            <div>
                                <h3>{post.user}</h3>
                                <p>{post.content}</p>
                            </div>
                        </div>
                        {
                            post.userId == user._id &&
                            <div className="btns">
                                {
                                    editId !== post.postId ?
                                    <>
                                        <button 
                                        onClick={()=>{
                                            setEditId(post.postId)
                                            setInput(post.content)
                                        }} className="btn-edit">Edit</button>
                                        <button 
                                        onClick={()=>handleDelete(post.postId)}
                                        className="btn-delete">Delete</button>
                                    </>
                                    :
                                    <>
                                    <input 
                                        type="text" 
                                        placeholder="edited message"
                                        value={input}
                                        onChange={(e)=>setInput(e.target.value)}
                                     />
                                     <button onClick={()=>handleSend(post.postId)} className="btn-edit">Send</button>
                                     <button 
                                        onClick={()=>setEditId(null)}
                                        className="btn-delete">Cancel</button>
                                     </>
                                }
                                
                            </div>
                        }
                    </div>
                ))
            }
        </div>
    )
}

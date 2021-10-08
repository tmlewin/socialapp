import axios from '../axios';
import React, { useContext, useState } from 'react'
import './css/PostForm.css'
import {v4 as uuidv4} from 'uuid';
import { updateContext } from '../context/updateContext';

export default function CreatePost() {

    const [updater, setUpdater] = useContext(updateContext)

    const [post, setPost] = useState('');
    const user = {_id: '123', username: 'tannerkc'}

    const handleSend = () =>{
        const postData = {
            userId: user._id,
            user: user.username,
            postId: uuidv4(),
            content: post
        }
        
        axios.post('/api/posts', postData)

        setPost('')
        setUpdater((state)=>state + 1)
    }

    return (
        <div className="post__form">
            <input 
                type="text" 
                placeholder="Tell us what's on your mind..." 
                value={post}
                onChange={(e)=>setPost(e.target.value)}
                maxLength={140}
            />
            <div>
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    )
}

import React, { useState, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import Compressor from 'compressorjs';
import axios from '../axios';
import './css/CreatePost.css';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

const CreatePost = ({ threadId, onPostCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            new Compressor(file, {
                quality: 0.6,
                maxWidth: 1000,
                maxHeight: 1000,
                success(result) {
                    resolve(result);
                },
                error(err) {
                    reject(err);
                },
            });
        });
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        const compressedFiles = await Promise.all(
            acceptedFiles.map(async (file) => {
                if (file.size > MAX_FILE_SIZE) {
                    return compressImage(file);
                }
                return file;
            })
        );

        setImages((prevImages) => [...prevImages, ...compressedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('threadId', threadId);
        formData.append('title', title);
        formData.append('content', content);
        images.forEach((image) => {
            formData.append('images', image);
        });

        try {
            const response = await axios.post('/api/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onPostCreated(response.data);
            setTitle('');
            setContent('');
            setImages([]); // Clear the images array
        } catch (error) {
            console.error('Error creating post:', error.response?.data || error.message);
        }
    };

    const modules = useMemo(() => ({
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
        ],
        clipboard: {
            matchVisual: false,
        },
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'image'
    ];

    return (
        <div className="create-post">
            <h3>Add a New Post</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Post Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    formats={formats}
                />
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p>Drop the images here ...</p>
                    ) : (
                        <p>Drag 'n' drop some images here, or click to select images</p>
                    )}
                </div>
                {images.length > 0 && (
                    <div className="image-preview">
                        {images.map((image, index) => (
                            <img
                                key={index}
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index + 1}`}
                                className="thumbnail"
                            />
                        ))}
                    </div>
                )}
                <button type="submit">Submit Post</button>
            </form>
        </div>
    );
};

export default CreatePost;

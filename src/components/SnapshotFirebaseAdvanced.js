// src/components/SnapshotFirebaseAdvanced.js
import React, { useState, useEffect, Fragment, useContext } from 'react';
import {
    doc,
    onSnapshot,
    setDoc,
    deleteDoc,
    updateDoc, // Ensure updateDoc is imported
    collection,
    serverTimestamp,
} from 'firebase/firestore';
import db from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '../auth/auth';

function SnapshotFirebaseAdvanced() {
    const collectionRef = collection(db, 'jobs');
    const { currentUser } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [status, setStatus] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentEditJob, setCurrentEditJob] = useState(null);

    useEffect(() => {
        if (currentUser) {
            setLoading(true);
            const unsub = onSnapshot(collectionRef, (querySnapshot) => {
                const items = [];
                querySnapshot.forEach((doc) => {
                    items.push(doc.data());
                });
                setJobs(items);
                setLoading(false);
            });
            return () => unsub();
        }
    }, [currentUser]);

    async function addJob() {
        const owner = currentUser ? currentUser.uid : 'unknown';
        const ownerEmail = currentUser ? currentUser.email : 'unknown';

        const newJob = {
            title,
            desc,
            status,
            id: uuidv4(),
            owner,
            ownerEmail,
            createdAt: serverTimestamp(),
            lastUpdate: serverTimestamp(),
        };

        try {
            const jobRef = doc(collectionRef, newJob.id);
            await setDoc(jobRef, newJob);
        } catch (error) {
            console.error('Error adding job:', error);
        }
    }

    async function deleteJob(job) {
        try {
            const jobRef = doc(collectionRef, job.id);
            await deleteDoc(jobRef);
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    }

    async function editJob() {
        if (!currentEditJob) return;

        const updatedJob = {
            title,
            desc,
            status,
            lastUpdate: serverTimestamp(),
        };

        try {
            const jobRef = doc(collectionRef, currentEditJob.id);
            await updateDoc(jobRef, updatedJob);
            // Reset the form
            setIsEditing(false);
            setCurrentEditJob(null);
            setTitle('');
            setDesc('');
            setStatus('');
        } catch (error) {
            console.error('Error updating job:', error);
        }
    }

    function handleEditClick(job) {
        setIsEditing(true);
        setCurrentEditJob(job);
        setTitle(job.title);
        setDesc(job.desc);
        setStatus(job.status);
    }

    return (
        <Fragment>
            <h1>Job Overview</h1>
            <div className="inputBox">
                <h3>{isEditing ? "Edit Job" : "Add New"}</h3>
                <h6>Title</h6>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <h6>Status</h6>
                <input
                    type="text"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                />
                <h6>Description</h6>
                <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />
                <button onClick={isEditing ? editJob : addJob}>
                    {isEditing ? "Update" : "Submit"}
                </button>
                {isEditing && <button onClick={() => setIsEditing(false)}>Cancel</button>}
            </div>
            <hr />
            {loading ? <h1>Loading...</h1> : null}
            {jobs.map((job) => (
                <div className="job" key={job.id}>
                    <h2>{job.title}</h2>
                    <p>{job.desc}</p>
                    <p>{job.status}</p>
                    <p>{job.ownerEmail}</p>
                    <div>
                        <button onClick={() => deleteJob(job)}>X</button>
                        <button onClick={() => handleEditClick(job)}>Edit</button>
                    </div>
                </div>
            ))}
        </Fragment>
    );
}

export default SnapshotFirebaseAdvanced;

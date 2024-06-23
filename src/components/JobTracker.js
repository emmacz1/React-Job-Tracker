import React, { useState, useEffect, Fragment, useContext } from 'react';
import { doc, onSnapshot, setDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import db from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '../auth/auth';

function JobTracker() {
    const colletionRef = collection(db, 'jobs');
    const { currentUser } = useContext(AuthContext);
    const currentUserId = currentUser ? currentUser.uid : null;
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        setLoading(true);
        const unsub = onSnapshot(colletionRef, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc.data());
            });
            setJobs(items);
            setLoading(false);
        });
        return () => unsub();
    }, []);

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
            const jobRef = doc(colletionRef, newJob.id);
            await setDoc(jobRef, newJob);
        } catch (error) {
            console.error(error);
        }
    }

    async function deleteJob(job) {
        try {
            const jobRef = doc(colletionRef, job.id);
            await deleteDoc(jobRef, jobRef);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Fragment>
            <h1>Jobs (SNAPSHOT)</h1>
            <div className="inputBox">
                <h3>Add New</h3>
                <h6>Title</h6>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                <h6>Status</h6>
                <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} />
                <h6>Description</h6>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
                <button onClick={() => addJob()}>Submit</button>
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
                    </div>
                </div>
            ))}
        </Fragment>
    );
}

export default JobTracker;

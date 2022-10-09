import { useState, useEffect } from 'react';
import Head from 'next/head'
import Image from 'next/image'

import Layout from '@components/Layout';
import Container from '@components/Container';
import Button from '@components/Button';

import { search, mapImageResources, getFolders } from '../lib/cloudinary';

import images from '@data/images';

import styles from '@styles/Home.module.scss'

export default function Home({images: defaultImages, nextCursor: defaultNextCursor, folders}) {
  console.log('start images',defaultImages);

  const [images, setImages] = useState(defaultImages);
  const [nextCursor, setNextCursor] = useState(defaultNextCursor);
  const [activeFolder, setActiveFolder] = useState('');

  console.log('activefolder', activeFolder);


  console.log('images', images);
  console.log('nextCursor', nextCursor);
  
  useEffect(() => {
    (async function run() {
      const results = await fetch('/api/search', {
        method: 'POST',
        body: JSON.stringify({
          nextCursor
        })
      }).then(r => r.json());

      console.log('result', results);

      
    })();
  }, []);


  async function handleLoadMore(event){
    event.preventDefault();
    const result = await fetch('/api/search', {
        method: 'POST',
        body: JSON.stringify({
          nextCursor,
          expression: `folder=${activeFolder}`
        })
      }).then(resp => resp.json());
      console.log('results', result);

      const { resources, next_cursor: updatedNextCursor } = result;
      const images = mapImageResources(resources);  

      setImages(prev => {
        return [
          ...prev,
          ...images
        ]
      });

      setNextCursor(updatedNextCursor);
  }

  function handleOnFolderClick(event){
    const folderPath =event.target.dataset.folderPath;
    setActiveFolder(folderPath);
    setNextCursor(undefined);
    setImages([]);
  }

  useEffect(() => {
    (async function run() {
      const result = await fetch('/api/search', {
        method: 'POST',
        body: JSON.stringify({
          nextCursor,
          expression: `folder=${activeFolder}`
        })
      }).then(resp => resp.json());
      console.log('results', result);

      const { resources, next_cursor: updatedNextCursor } = result;
      const images = mapImageResources(resources);  

      setImages(prev => {
        return [
          ...prev,
          ...images
        ]
      });

      setNextCursor(updatedNextCursor);
    })

  }, [activeFolder])

  return (
    <Layout>
      <Head>
        <title>My Images</title>
        <meta name="description" content="All of my cool images." />
      </Head>

      <Container>
        <h1 className="sr-only">My Images</h1>

        <h2 className={styles.header}>Folder</h2>

        <ul className={styles.folders} onClick={handleOnFolderClick }>
          {folders.map(folder => {
            return (
              <li key={folder.path} >
                <button data-folder-path={folder.path}>{ folder.name }</button>
              </li>
            )
          })}
        </ul>

        <h2 className={styles.header}>Images</h2>

        <ul className={styles.images}>
          {images.map(image => {
            return (
              <li key={image.id}>
                <a href={image.link} rel="noreferrer">
                  <div className={styles.imageImage}>
                    <Image width={image.width} height={image.height} src={image.image} alt="" />
                  </div>
                  <h3 className={styles.imageTitle}>
                    { image.title }
                  </h3>
                </a>
              </li>
            )
          })}
        </ul>
        <p>
          <Button onClick={handleLoadMore}>
            Load More Results
          </Button>
        </p>
      </Container>
    </Layout>
  )
}

export async function getStaticProps() {
  const result = await search({
    expression: 'folder=""'
  }); 
  const { resources, next_cursor: nextCursor } = result;

  const images = mapImageResources(resources);  

  const {folders} = await getFolders();

  console.log('folders', folders);

  return {
    props: {
      images,
      nextCursor: nextCursor || false,
      folders
    } 
  }
}
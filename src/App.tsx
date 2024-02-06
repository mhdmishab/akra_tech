import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, CardMedia, CircularProgress, Typography } from '@mui/material';
import { IUser, usersTable } from './Db/Db';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<IUser[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchData = async () => {
    try {
      localStorage.clear();

      const usersFromDB = await usersTable.toArray();

      const response = await fetch('https://randomuser.me/api/?results=50');
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const userDataArray: IUser[] = data.results.map((user: any, index: any) => ({
          id: index + 1, 
          name: {
            first: user.name?.first || '',
            last: user.name?.last || '',
          },
          picture: {
            large: user.picture?.large || '',
          },
        }));
        console.log(userDataArray);

        if (usersFromDB.length === 0) {
          await usersTable.bulkAdd(userDataArray);
        }        
        setUsers(userDataArray);
        console.log(usersFromDB.length);
        console.log(data.results.length);
        setTotalItems(data.results.length);
       
        localStorage.setItem('users', JSON.stringify(userDataArray));

        localStorage.setItem('totalItems', data.results.length.toString());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    fetchData();
  };

  const deleteUser = async (userId: number) => {
    try {
      console.log(users);
      if (userId != null) {
        await usersTable.where('id').equals(userId).delete();
   
        const localStorageUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedLocalStorageUsers = localStorageUsers.filter((user: IUser) => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(updatedLocalStorageUsers));
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setTotalItems((prevTotal) => prevTotal - 1);
      } else {
        console.error('Invalid userId:', userId);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  useEffect(() => {
    const getDataFromIndexedDB = async () => {
      try {
        const localStorageUsers = JSON.parse(localStorage.getItem('users') || '[]');
        console.log(localStorageUsers);
        setUsers(localStorageUsers);
        setTotalItems(localStorageUsers.length);
      } catch (error) {
        console.error('Error retrieving data from IndexedDB:', error);
      } finally {
        setLoading(false);
      }
    };

    getDataFromIndexedDB();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Button style={{width:'300px'}} variant="contained" color="primary" onClick={refreshData}>
        Refresh
      </Button>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Typography variant="h5">Total Items: {totalItems}</Typography>
          <Box display="flex" flexWrap="wrap" justifyContent="space-around">
            {users?.map((user: any) => (
              <Card key={user.id} style={{ margin: '10px', height: '300px', width: '300px' }}>
                <CardMedia component="img" alt={user.name?.first} height="140" image={user.picture?.large} />
                <CardContent>
                  <Typography variant="h6">{`${user.name?.first} ${user.name?.last}`}</Typography>
                  <Button color="secondary" onClick={() => deleteUser(user.id)}>
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}
    </div>
  );
};

export default App;

/**screenshots are in my assets folder
 * 
 * 
 * 
 */
import {useState , useEffect} from 'react'
import { FlatList, View, Text, StyleSheet  } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const cacheKey = '@uj/notices/cache'
const updateKey = '@uj/notices/lastUpdated'

export default function App(){
  /**setting my states (notices,loading,error) */
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  /**states fro when app is offline */
  const [lastUpdated, setLastUpdated] =useState(null)
  const [isCached,setIsCached]= useState(false)

  /**read what was last saved */
const loadFromCache = async () =>{
  try{
    const cachedNotices = await AsyncStorage.getItem(cacheKey)
    const cachedTime = await AsyncStorage.getItem(updateKey)

    if (cachedNotices){
      setNotices(JSON.parse(cachedNotices))
      setIsCached(true)
    }
    if (cachedTime){
      setLastUpdated(cachedTime)
    }
  }
  catch (e){
    console.log('Cache read error: ',e.message)
  }
}

  const loadNotices = async() => {
    try{
      setLoading(true)
      setError(false)
      
      const response = await fetch ('https://jsonplaceholder.typicode.com/posts')

      if (!response.ok){
        throw new Error('Sorry the response was not good')
      }

      /**turning my data into a json array */
      const data = await response.json()

      /**displaying only the first 10 */
      const first10 = data.slice(0,10)
      setNotices(first10)

      /**saving notices as cached data  */
      const now = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
      setLastUpdated(now)
      await AsyncStorage.setItem(cacheKey,JSON.stringify(first10))
      await AsyncStorage.setItem(updateKey,now)
      setIsCached(false)
    }

    /**what to display if theres an error  */
    catch (e){
      setError(true)
      console.log('Error :',e.message)
    }
    /**stop loading  */
    finally {
      setLoading(false)
    }
  }

const clearSavedNotices = async () =>{
  try{
    await AsyncStorage.removeItem(cacheKey)
    await AsyncStorage.removeItem(updateKey)
    setNotices([])
    setLastUpdated(null)
    setIsCached(false)
  }
  catch(e){
    console.log('Cleare cache:',e.message)
  }
}

/**when it runs it should reach cache first  */
const statRun =async() =>{
  setLoading(true)
  await loadFromCache()
  await loadNotices()
}

useEffect(() =>{
  statRun()
},[])

    /**aas soon as the screen opens notcies should be rendered */

    if (loading){
      return(
      <View style ={styles.states}>
        <Text >Loading ...........</Text>
      </View>
      )
    }
    if(error){
      return(
        <View style={styles.states}>
          <Text>Error loading, please try to refresh</Text>
        </View>
      )
    }
    /**the flatlist  rendering the notcies*/
    return(
      <View style={styles.container}>
        <Text style={styles.heading}>UJ Campus Notices</Text>

        <Text style ={styles.status}>
          {error
          ? `Saved copy, last updated ${lastUpdated}`
          : isCached
          ? `Last updated ${lastUpdated}`
          : ''}
        </Text>

        <FlatList
          data={notices}
          keyExtractor ={(item) => String(item.id)}
          renderItem ={({item}) => <NoticeCard notice={item}/>}
        />
      </View>
    )
  }
    /**creating the notcie card using  props so i can display the title and description of the item  */
  function NoticeCard({notice}){
    return(
      <View style={styles.container}>
        <Text style={styles.title}>{notice.title}</Text>
        <Text style={styles.description}>{notice.body}</Text>
      </View>
    )
}

 const styles = StyleSheet.create({
      container :{flex:1},
      states :{flex:1,justifyContent:'center' , alignItems:'center'},
      heading:{fontSize:20},
      status:{fontSize:12},
      title:{fontSize:14},
      description:{fontSize:12}
    })



import React from 'react';
import _ from "lodash"
import { StyleSheet, Text, View, Switch, TextInput, FlatList, Button, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import AsyncStorage  from '@react-native-async-storage/async-storage'
import Slider from '@react-native-community/slider'
import {supermemo, SuperMemoItem, SuperMemoGrade} from 'supermemo'
import  {createBottomTabNavigator} from '@react-navigation/bottom-tabs'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()
export default class App extends React.Component {
  render () {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home}/>
      <Stack.Screen name="Subjects" component={Subjects}/>
      <Stack.Screen name="SubTopics" component={SubTopics}/>
      <Stack.Screen name="OrderedTopics" component={OrderedTopics}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
}
// yeah idk what's happeening with thee text, maybe not given right data ins subjects
// also have to fix the switch
// the time is nan because topics haven't been setup correct, so have to create new ones
class Home extends React.Component{
  constructor(props) {
    super(props);
    this.state = {}
  }
  render() {
    return(
      <Tab.Navigator>
        <Tab.Screen name="Subjects" component={Subjects}/>
        <Tab.Screen name="Topics" component={OrderedTopics}/>
      </Tab.Navigator>
)
  }
}
class Subjects extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topic : '',
      topics : null,
      newTops : "yeet",
      data  : null,
      conversion : 255 /(2*60*60*24*7)
    }
  }

  NavigateTopic(title) {
    this.props.navigation.navigate("SubTopics", {"topic" : title})
    //console.log("AMERICANBOYFRIEND")
  }

  HandleInput = (text) => {
    console.log("wehave")
    this.setState({
      topic: text
    })
  }

  SubmitInput = async () => {
    console.log("hi")
    let topics = null
    let newTops = null
    try
    {
      topics = JSON.parse(await AsyncStorage.getItem('topics'))
    }
    catch(e)
    {
    }
    let config = {
      interval:0, repetition:0, efactor:2.5
    }
    if (topics != null)
    {
      topics[this.state.topic] = {"subjects" : [], "topics" : [], parent : null , "colour" : 'rgb(0,255,0)',  'name' : this.state.topic}
    }
    else
    {

      //console.log("NOWGETHEFUCKOUTMYRIDE")
      topics = {}
      topics[this.state.topic] = {"subjects" : [], "topics" : [], parent : null, "colour" : 'rgb(0,255,0)', 'name' : this.state.topic}
    }
    console.log(topics)
    console.log(this.state.topics)
    console.log("me")
    topics = JSON.stringify(topics)
    try
    {
      await AsyncStorage.setItem('topics', topics)
    }
    catch (e){
    }
    try
    {
      await AsyncStorage.setItem("timeStart", JSON.stringify(Date.now()))
    }
    catch (e)
    {
    }
    this.props.navigation.navigate("SubTopics", {"topic" : this.state.topic})
  }
  async DeleteSubject(subject) {
    let topics = null
    //console.log(subject)
    try{
      topics = JSON.parse(await AsyncStorage.getItem('topics'))
    }
    catch(e)
    {
    }
    //console.log(topics)
    delete topics[subject]
    console.log(topics)
    try{
      await AsyncStorage.setItem('topics', JSON.stringify(topics))
    }
    catch(e)
    {
    }
    let tops = {}
    let keys = Object.keys(topics)
    let actkeys = []
    for (let i=0;i<topics.length;i++)
    {
      if (topics[keys[i]]["parent"] === null)
      {
        tops[keys[i]] = topics[keys[i]]
        actkeys.push(keys[i])
      }
    }
    this.setState({
      data: tops,
      topics : actkeys
    })
    //console.log(this.state.topics)
  }

  async CalcSubjectDecay() {
    let data = null
    //console.log(this.state.topics)
    try{
      data = JSON.parse(await AsyncStorage.getItem('topics'))
    }
    catch(e)
    {}
    //console.log(data)
    //console.log('fucyall')
    let keys = []
    for (let w=0;w<Object.keys(data).length;w++)
    {
      keys[w] = {'keys' : Object.keys(data)[w], 'depth' : 0}
    }
    //console.log("keeeeys")
    //console.log(keys)
    for (let i=0;i<keys.length;i++)
    {
      let parent = data[keys[i].keys].parent
      while(parent!==null)
      {
        keys[i]["depth"] += 1
        //console.log(parent)
        if(parent in data)
        {
          parent = data[parent].parent
        }
        else
        {
          parent = null
        }
        //console.log("fuckoffretard")
      }
      let tops = data[keys[i].keys]["topics"]
      let subs = data[keys[i].keys]["subjects"]
      let colour = [0,0,0]
      //console.log(tops)
      for(let j=0;j<tops.length;j++)
      {
        let newColour = tops[j].colour.split(',')
        //console.log('boo')
        //console.log(newColour)
        newColour[0] = newColour[0].split('(')[1]
        //console.log(newColour[0])
        const time = Date.now()
        const day = 3
        //console.log(this.state.currentTopic)
        let timeStart = tops[j].timeStart
        let visualDiff = newColour[0]
        let diff = ((time - timeStart) / 1000) * this.state.conversion
        let newDiff = diff - visualDiff
        let green =  parseInt(newColour[1]) - newDiff
        let red = parseInt(newColour[0]) + newDiff
        //console.log('ringserneh')
        //console.log(visualDiff)
        //console.log(newDiff)
        //console.log(diff)
        ////console.log(diff)
        if (green > 255)
        {
          green = 255
        }
        if (red > 255)
        {
          red = 255
        }
        if (green < 0)
        {
          green = 0
        }
        if (red < 0)
        {
          red = 0
        }
        let topicColour =  `rgb(${red},${green},0)`
        data[keys[i].keys]["topics"][j].colour = topicColour
        tops[j].colour = topicColour
        tops[j].changeColour = 'rgb(0,255,0)'
          colour[0] += parseInt(red)
          colour[1] += parseInt(green)
      }
    }
    let sorted = false
    while(sorted == false)
    {
     let counter =0
    for (let e=0;e<keys.length - 1;e++)
    {
      //console.log('number')
      //console.log(keys[e].depth)
      //console.log(keys[e+1].depth)
      if (keys[e].depth < keys[e+1].depth)
      {
        let copy = _.cloneDeep(keys[e])
        keys[e] = keys[e+1]
        keys[e+1] = copy
      }
      else
      {
        counter+=1
      }
    }

    //console.log(counter)
    if (counter === keys.length - 1)
    {
      sorted = true
    }
  }
    //console.log('keys')
    //console.log(keys)
    //console.log(data)
    for (let y=0;y<keys.length;y++)
    {
      let colour = [0,0,0]
      let tops = data[keys[y].keys]["topics"]
      //console.log('sweetwomen')
      //console.log(tops)
      let subs = data[keys[y].keys]["subjects"]
      for(let x=0;x<subs.length;x++)
      {
        let newCol = data[subs[x].text].colour.split(',')
        newCol[0] = newCol[0].split('(')[1]
        colour[0] += parseInt(newCol[0])
        colour[1] += parseInt(newCol[1])
      }
      for(let s=0;s<tops.length;s++)
      {
        let newCol = tops[s].colour.split(',')
        newCol[0] = newCol[0].split('(')[1]
        colour[0] += parseInt(newCol[0])
        colour[1] += parseInt(newCol[1])
      }
      let length = tops.length + subs.length
      //console.log('colour')
      //console.log(length)
      //console.log(colour)
      
      data[keys[y].keys]["colour"] = `rgb(${colour[0] / length },${colour[1] / length},0)`
      //console.log("gocatsgoi")
      //console.log(data)
    }
    try{
      await AsyncStorage.setItem('topics', JSON.stringify(data))
    }
    catch(e)
    {
    }
    let tops = {}
    let actKeys = []
    let key = Object.keys(data)
    for (let i=0;i<key.length;i++)
      {
        if (data[key[i]]["parent"] === null)
        {
          tops[key[i]] = data[key[i]]
          actKeys.push(key[i])
        }
      }
      let counter = 0
      while(counter !== actKeys.length - 1)
      {
        counter = 0
      for (let i=0;i<actKeys.length - 1;i++)
      {
        let newCol1 = tops[actKeys[i]].colour.split(',')
        let newCol2 = tops[actKeys[i+1]].colour.split(',')
        newCol1[0] = newCol1[0].split('(')[1]
        newCol2[0] = newCol2[0].split('(')[1]
        // console.log('bigamn')
        // console.log(tops[actKeys[i]].colour)
        // console.log(tops[actKeys[i+1]].colour)
        // console.log("num1")
        // console.log(actKeys[i])
        // console.log(actKeys[i+1])
        // console.log(newCol1)
        // console.log(newCol2)
        if (parseInt(newCol1[0]) < parseInt(newCol2[0]))
        {
          let copy = _.cloneDeep(actKeys[i])
          actKeys[i] = actKeys[i+1]
          actKeys[i+1] = copy
          // console.log('takethel')
        }
        else
        {
          counter+=1
          // console.log('kdencomemywaydeng')
          // console.log(newCol1)
          // console.log(newCol2)
        }
        // console.log("num2")
      }
    }
    this.setState({
      topics : actKeys,
      data : tops
    })
    // console.log('mfdoomtothetomb')
    // console.log(this.state.topics)
    // console.log(this.state.data)
  }

  async componentDidMount() {
    //await AsyncStorage.clear()
    //let topics = {"Physics" : {'colour' : 'rgb(255,0,0)'"parent" : null, "topics": null ,"subjects" : ["Physics Paper 1" , "Physics Paper 2"]} , "Physics Paper 1" : {"parent" : "Physics" , "subjects" : null , "topics" :["Moments", "Projectile Motion", "Momentum and Force", "Work, Energy and Power", "Materials", "Stars", "Particle Physics"]}, "Physics Paper 2" : {"parent" : "Physics", "subjects" : null, "topics" : ["Circuits" , "Waves", "Lasers" ]}, "Further Maths" : {"parent" : null, "topics" : null, "subjects" : ["FP1", "FS1" , "FM1"]}, "FP1" : {"parent" : "Further Maths", "subjects" : null, "topics" : ["Complex Numbers", "Matrices", "Roots, Series, Summation", "Further Vectors"]}, "FS1" : {"parent" : "Further Maths", "subjects" : null, "topics" : ["Discrete Distributions", "Poisson Distributions" ,"Chi Squared Test 1" ,"Chi Squared Test 2", "Correlation"]}, "FM1" : {"parent" : "Further Maths", "subjects" : null, "topics" : ["Momentum", "Energy" , "Collisons"]}, "Maths" : {"parent" : null, "topics" : null, "subjects" : ["Pure" , "Statistics", "Mechanics"]}, "Pure" : {"parent": "Maths", "subjects" : null, "topics" : ["Solving Quadratics", "Coordinate Geometry", "Trigonometry" , "Polynomials", "Binomials Expansion", "Transformations and Graphs", "Differentiation" , "Integration", "Vectors", "Logarithms"]}, "Statistics" : {"parent" : "Maths", "subjects" : null, "topics" : ["Data", "Hypothesis Testing"]}, "Chemistry" : {"parent" : null, "topics" : null, "subjects" : ["Chemistry Paper 1" , " Chemistry Paper 2"]}, "Chemistry Paper 1" : {"parent" : "Chemistry", "subjects" : null, "topics" : ["Basics, Atoms, Electrons", "Calculations" , "Bonding and Structures", "Periodicity", "Equilibrium Reactions and Acid-Base"]}, "Chemistry Paper 2" : {"parent" : "Chemistry", "subjects" : null, "topics" : ["Energy", "Rates of Reaction", "Impacts of Chemistry", "Hydrocarbons", "Halogenoalkanes", "Alcohols", "Carboxylic Acids", "Spectrosopy"]}, "A2 Maths" : {parent : null, subjects : ["A2 Pure Maths"], topics : null}, "A2 Pure Maths" : {parent : "A2 Maths", subjects : null, topics : ["Trig Graphs", "Parametric Equations", "Numeric Methods", "Fractional Binomial Expansion", "Functions", "Modulus", "Trig Identities", "Transformations"]}, "A2 Further Maths" : {parent : null, subjects : ["A2 Further Stats", "A2 Further Pure"], topics : null}, "A2 Further Stats" : {parent : "A2 Further Maths", subjects : null, topics : ["Combinatorics"]}, "A2 Further Pure" : {parent : "A2 Further Maths", subjects : null, topics : ["Hyperbolic Functions + graphs", "Inverse Trig + graphs", "First Order Diff Equations", "Second Order Diff Equations", "Coupled Diff Equations", "Further Integration", "Further Differentiation", "Roots Of Unity", "Maclaurin Series", "De Moivre's Theorem", "Improper Integrals", "Volumes Of Revolution"] }}
    // this shit fucking retarted, just die man, like it points out different commas in cmd and web
    // tbh i doubt this would work anyway, but i don't know why reg setup no work
    // console.log(topics);
    let topics = null;
    console.log("bigwheel")
    // try
    // {
    // await AsyncStorage.setItem('topics', JSON.stringify(topics))
    // }
    // catch(e)
    // {}

    let toops = null
    try{
      toops = JSON.parse(await AsyncStorage.getItem('topics'))
    }
    catch(e){}
    console.log("swaghoe")
    console.log(toops)

    // can't get this to work and cba to try any more
    // the majority of topics are decayed anyways, so little harm in just redoing them all
    // eveythin else pretty much works i think, although topics tab very slow
    // the topics are like no colour in topics tab because they dont have sm2 colour
    // the sorting in topics also seems to work
    // console.log("MONSIEUR YOU ARE BIG GAY ENERGY")
    // console.log(toops["A2 Further Pure"]["topics"][0])
    let objectif = {'sm2_conversion' : 60*60*24, 'interval' : 1, 'sm2_timeStart' : Date.now(), 'efactor' : 2.5, 'nextRep' : 1, 'intervals' : {1:1, 2:6}, 'sm2_colour' : 'rgb(0,255,0)', 'displayedColour' : 'rgb(0,255,0)'}
    let monKeys = Object.keys(objectif)
    
    let monKeys2 = Object.keys(toops)
    for(let y=0;y<monKeys2.length;y++)
    {
      for(let x=0;x< toops[monKeys2[y]]["topics"].length;x++)
      {
        for(let i=0;i<monKeys.length;i++)
        {
          toops[monKeys2[y]]["topics"][monKeys[i]] = objectif[monKeys[i]]
        }
      }
    }
    try{
      await AsyncStorage.setItem('topics',JSON.stringify(toops))
    }
    catch(e){}
  console.log("pullup")
    //catch(e)
    //{}
    this.CalcSubjectDecay()
    console.log("goddamn")
    let obj = toops
    console.log("swaggyp")
    
     //obj = JSON.parse(obj)
     console.log("gay")
        let tops = {}
        let keys = Object.keys(obj)
        let actkeys = []
        let newCol1 = null
        let newCol2 = null
        for (let i=0;i<keys.length;i++)
        {
          if (obj[keys[i]]["parent"] === null)
          {
            tops[keys[i]] = obj[keys[i]]
            actkeys.push(keys[i])
          }
          console.log("hmm")
          //for(let f=0;f<obj[keys[i]].topics.length;f++)
          //{
            //obj[keys[i]].topics[f].colour = 'rgb(125,125,0)'
          //}
        }
        console.log("yee")
        let pee = JSON.stringify(obj)
        console.log("aha")
        try
        {
          await AsyncStorage.setItem('topics', JSON.stringify(obj))
        }
        catch(e)
        {
          console.log("wow")
          console.log(e)
        }
        console.log("fat")
      

        let sorted = false
        console.log("fag")
        while(sorted == false)
        {
          let counter = 0
        for (let i=0;i<actkeys.length - 1;i++)
      {
        newCol1 = tops[actkeys[i]].colour.split(',')
        newCol2 = tops[actkeys[i+1]].colour.split(',')
        newCol1[0] = newCol1[0].split('(')[1]
        newCol2[0] = newCol2[0].split('(')[1]
        // console.log('bigamn')
        // console.log(tops[actkeys[i]].colour)
        // console.log(tops[actkeys[i+1]].colour)
        // console.log("num1")
        // console.log(actkeys[i])
        // console.log(actkeys[i+1])
        if (parseInt(newCol1[0]) < parseInt(newCol2[0]))
        {
          let copy = _.cloneDeep(actkeys[i])
          actkeys[i] = actkeys[i+1]
          actkeys[i+1] = copy
          console.log('takethel')
        }
        else
        {
          counter++
        }
      }
      if(counter == actkeys.length - 1)
      {
        sorted = true
      }
    }


    this.setState({
      topics: actkeys,
      data : tops
    })
    console.log("giannis")
    console.log(this.state.topics)
    this.CalcLargestDecay()
    const TitlesChange = this.props.navigation.addListener('focus', async () => {
      console.log("giannis")
    console.log(this.state.topics)
      this.CalcSubjectDecay()
      let newCol1 = null
      let newCol2 = null
      let obj = null
      try{
        obj = await AsyncStorage.getItem('topics')
      }
      catch(e)
      {}
      
      obj = JSON.parse(obj)
        let tops = {}
        let actkeys = []
      if(obj !== null)
      {
        let keys = Object.keys(obj)
        for (let i=0;i<keys.length - 1;i++)
        {
          if (obj[keys[i]]["parent"] === null)
          {
            tops[keys[i]] = obj[keys[i]]
            actkeys.push(keys[i])
          }
        }
      }
      let sorted = false
      while(sorted == false)
      {
        let counter = 0
      for (let i=0;i<actkeys.length - 1;i++)
      {
        newCol1 = tops[actkeys[i]].colour.split(',')
        newCol2 = tops[actkeys[i+1]].colour.split(',')
        //newCol1[0] = newCol1[0].split('(')[1]
        //newCol2[0] = newCol2[0].split('(')[1]
        if (parseInt(newCol1[1]) > parseInt(newCol2[1]))
        {
          let copy = _.cloneDeep(actkeys[i])
          actkeys[i] = actkeys[i+1]
          actkeys[i+1] = copy
        }
        else
        {
          counter++
        }
      }
      if(counter == actkeys.length - 1)
      {
        sorted = true
      }
    }
      this.setState({
        topics : actkeys,
        data : tops
      })
      //console.log('goated')
      //console.log(this.state.topics)
      //console.log(this.state.data)
      this.CalcLargestDecay()
    });
  
    console.log("bitch")

  }
  async CalcLargestDecay() {
    let topics = null
    try
    {
      topics = JSON.parse(await AsyncStorage.getItem('topics'))
    }
    catch(e){}
    let keys = Object.keys(topics)
    //console.log(keys)
    let worstScore = Infinity
    let worstTopic = null
    //console.log("endless")
    //console.log(topics)
    //console.log(keys)
    for(let i=0;i<keys.length;i++)
    {
      let keysT = Object.keys(topics[keys[i]]["topics"])
      for(let j=0;j<keysT.length;j++)
      {
        let topic = topics[keys[i]]["topics"][keysT[j]]
        if(topic.timeStart < worstScore)
        {
          worstTopic = topic
          worstScore = topic.timeStart
        }
      }
    }
    // shoud work, perhaps add if conditions to determine whether to display week days minutes  
    let seconds = Math.round((Date.now() - worstScore) / 1000)
    let minutes = Math.round(seconds / 60)
    let hours = Math.round(seconds / 3600)
    let days = Math.round(seconds / (24 * 3600))
    let formatedTime = null
    if(days > 0)
    {
      formatedTime = (`${days} Days `)
    }
    else if (hours > 0)
    {
      formatedTime = (`${hours} Hours`)
    }
    else if (minutes > 0)
    {
      formatedTime = (`${minutes} Minutes`)
    }
    else
    {
      formatedTime = (`${seconds} Seconds`)
    }
    //let formatedTime = (`${days} Days , + ${hours} Hours, + ${minutes} Minutes, + ${seconds} Seconds `)
    // Alert.alert(
    //   `You Should Revise ${worstTopic.name}`,
    //   `You haven't revised it in ${formatedTime}`,
    //   [
    //     {
    //       'text' : 'OK',
    //       style:"cancel"
    //     },
    //     {
    //       'text' : 'See All Topics',
    //       onPress: () => this.props.navigation.push('OrderedTopics')
    //     }
    //   ],
    //   { cancelable: true }
    // )
  }

  CreateAlert(item){
    Alert.alert(
      "Are You Sure?",
      "This Deletion is Irreversible",
      [
        {
          'text' : 'Cancel',
          style:"cancel"
        },
        {
          'text' : 'OK',
          onPress:() => this.DeleteSubject(item)
        }
      ],
      { cancelable: true }
    )
  }
  render() {
    //console.log('render')
    //console.log(this.state.topics)
    return(

    <View style={{flex : 1}}>
    <TextInput placeholder="Create a Subject" onChangeText={this.HandleInput} onSubmitEditing={this.SubmitInput}></TextInput>
    <View style={{flex : 1}}>
    <FlatList style={{flex : 1}}
    data = {this.state.topics}
    extraData={this.state}
    keyExtractor = {(item ,index) => index.toString()}
    renderItem = {({item}) => { return (
      <View style={{borderWidth: 0, margin: 40, backgroundColor: this.state.data[item].colour }}>
        <Text style={{ fontSize: 30, textAlign: 'center'}}>{this.state.data[item].name}</Text>
        <View style={{marginTop: 10, marginBottom: 10}}>
        <Button title={"View " + this.state.data[item].name + "'s Topics"} onPress={() => this.NavigateTopic(this.state.data[item].name)} style={{marginBottom:5}}></Button>
        </View>
        <Button title={"Delete " + this.state.data[item].name} onPress={() => this.CreateAlert(this.state.data[item].name)} style={{marginBottom:5}}></Button>
      </View>
      
    )
  }
}
/>
</View>    
</View>

    )
}
}


class SubTopics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textT : '',
      textS : '',
      timeStart : 0,
      sm2_timeStart : 0,
      yellow : 3,
      red : 7,
      colour : 'green',
      data : [],
      currentTopic: this.props.route.params.topic,
      dampingFactor : 0.7,
      subjects : [],
      topics: [],
      currentData : null,
      switch : false,
      conversion : 255 /(2*60*60*24)
      
    }
  }

  NavigateSubject(name)
  {
    this.props.navigation.replace('SubTopics', {'topic' : name})
  }

  HandleInput(text, type) {
    //console.log(text)
    if(type === "topic")
    this.setState({
      textT: text
    })
    else
    {
      this.setState({
        textS: text
      })
    }
  }

  SubmitInput = async (type) => {
    let topics = null
    let StorTopics = null
    let tops = this.state.topics
    let subs = this.state.subjects
    //console.log('2o')
    //console.log(this.props.route.params.topic)
    this.setState({
      currentTopic: this.props.route.params.topic
    })

    try
    {
      StorTopics = JSON.parse(await AsyncStorage.getItem('topics'))
    }
    catch(e)
    {
    }

    if(type === "topic")
    {
      let conv = 255/(60*60*24)
      let time = Date.now()
      StorTopics[this.state.currentTopic]["topics"].push({ 'name' : [this.state.textT], 'timeStart' : 0, 'colour' : 'rgb(255,0,0)', 'changeColour' : 'rgb(0,255,0)', 'parent' : this.state.currentTopic, 'sm2_conversion' : conv, 'interval' : 1, 'sm2_timeStart' : time, 'efactor' : 2.5, 'nextRep' : 1, 'intervals' : {1:1, 2:6}, 'sm2_colour' : 'rgb(0,255,0)', 'displayedColour' : 'rgb(0,255,0)'})


      tops.push({ 'name' : [this.state.textT], 'timeStart' : 0, 'colour' : 'rgb(255,0,0)', 'changeColour' : 'rgb(0,255,0)', 'parent' : this.state.currentTopic, 'sm2_conversion' : conv, 'interval' : 1, 'sm2_timeStart' : time, 'efactor' : 2.5, 'nextRep' : 1, 'intervals' : {1:1, 2:6}, 'sm2_colour' : 'rgb(0,255,0)'})
      StorTopics[this.state.currentTopic]["topics"] = tops
    }

    else
    {
      StorTopics[this.state.textS] = {"subjects" : [], "topics" : [], "parent": this.state.currentTopic, 'colour' : 'rgb(0,255,0)', 'name' : this.state.textS}
      subs.push({'text' : this.state.textS, 'colour' : 'rgb(0,255,0)', 'name' : this.state.textS})
      StorTopics[this.state.currentTopic]["subjects"].push({'text' : this.state.textS, 'colour' : 'rgb(0,255,0)'})
    }
    // seemingly not saving the topic data
    // although it does add to state, but not save
    try{
      await AsyncStorage.setItem("topics", JSON.stringify(StorTopics))
    }
    catch (e){
    }
    let obj = null
    StorTopics = StorTopics
    this.setState({
      timeStart : Date.now(),
      data : StorTopics,
      topics : tops,
      subjects: subs
    
    })
  }
  limitVal(limitU,limitL, variable) {
      if (variable > limitU)
      {
        return limitU
      }
      else if(variable < limitL)
      {
        return limitL
      }
      else
      {
        return variable
      }
  }

  

  async Reset(item, change){
    let index = null
    let full = null
    //console.log("THANKGODYOULETMECRASHONYOURCOUCH")
    //console.log(this.state)
    let data = this.state.data;
    let topics = this.state.topics
    //console.log(change)
    let newChange = change.split(',')
    let newColour = [0,0]
    //console.log(newChange)
    newChange[0] = newChange[0].split('(')[1]
    for (let i=0;i<this.state.topics.length;i++)
    {

      if(topics[i].name === item)
      {

        index = i
      }
    }
    
    let oldColour = topics[index].colour.split(',')
    oldColour[0] = oldColour[0].split('(')[1]
    let newVar = parseInt(oldColour[1]) + (this.state.dampingFactor * parseInt(newColour[1]))
    newColour[0] = parseInt(oldColour[0]) + (this.state.dampingFactor * parseInt(newChange[0])) - newChange[1]

    newColour[1] =  parseInt(oldColour[1]) + (this.state.dampingFactor * parseInt(newChange[1])) - newChange[0]
    let intNewChange1 = parseInt(newChange[1])
    let sm2_score = 5 * (intNewChange1/255)

    let easing_factor = Math.max(1.3,topics[index].efactor + (0.1 - ((5-sm2_score) * (0.08 + ((5-sm2_score) * 0.02)))))
    // console.log("ease")
    // console.log(easing_factor)
    // console.log(sm2_score)
    // console.log(intNewChange1)
    // console.log(topics[index].intervals)
    // console.log(topics[index].nextRep)
    let nextRep = topics[index].nextRep + 1
     //console.log(nextRep)
    if(sm2_score < 3)
    {
      nextRep = 2
    }
    let interval = topics[index].intervals[nextRep - 1] * easing_factor
    //console.log(interval)
    if(nextRep < 4)
    {
      interval = topics[index].intervals[nextRep - 1]
    }
    let sm2_conversion = 255/this.state.interval * (60*60*24)
    if(nextRep > 2)
    {
      topics[index].intervals[nextRep] = interval
      data[this.state.currentTopic]["topics"][index].intervals[nextRep] = interval
    }
    //console.log('slapthatdickman')
    //console.log(newChange)
    //console.log(newColour)
    for(let i=0;i<2;i++)
    {
      newColour[i] = this.limitVal(255,0,newColour[i])
    }
    let colour =  `rgb(${newColour[0]},${newColour[1]},40)` 
    let timeStart = Date.now() - ((newColour[0]  / this.state.conversion)*1000)
    // sm2_timeStart just goes green as soon as revised, then decays evenly over its interval, maybe should change this 
    // to represent the interval or somethin,g, so a short interval  indicates not a lot of reps
    let sm2_timeStart = Date.now()
    topics[index].timeStart = timeStart
    topics[index].sm2_conversion = sm2_conversion
    topics[index].interval = interval
    topics[index].sm2_timeStart = sm2_timeStart
    topics[index].efactor = easing_factor
    topics[index].sm2_colour = 'rgb(0,255,40)'
    topics[index].colour = colour
    topics[index].nextRep
    //topics[index].sm2_colour = sm2_colour
    data[this.state.currentTopic]["topics"][index].timeStart = timeStart
    data[this.state.currentTopic]["topics"][index].colour = colour
    data[this.state.currentTopic]["topics"][index].sm2_conversion = sm2_conversion
    data[this.state.currentTopic]["topics"][index].interval = interval
    data[this.state.currentTopic]["topics"][index].sm2_timeStart = sm2_timeStart
    data[this.state.currentTopic]["topics"][index].efactor = easing_factor
    data[this.state.currentTopic]["topics"][index].sm2_colour = 'rgb(0,255,40)'
    data[this.state.currentTopic]["topics"][index].nextRep = nextRep
    this.setState({
      timeStart : Date.now(),
      topics : topics,
      data: data,
    })
    // so plan is to have two tabs on bottom of screen
    // one that display with regular intervals i.e how long since revised, and another which display sm2 interval
    // just have to make sure that sm2 doesn't change anything , in partic the timestart
    //console.log(this.state.topics)
    try
    {
      await AsyncStorage.setItem('topics',JSON.stringify(data))
    }
    catch (e){
    }
  }

  async CalcSubjectDecay() {
    let data = null
    try{
      data = JSON.parse(await AsyncStorage.getItem('topics'))
    }
    catch(e)
    {}
    let tops = data[this.state.currentTopic]["subjects"]
    //console.log("samurai")
    //console.log(data)
    for (let i=0;i<tops.length;i++)
    {
      tops[i].colour = data[tops[i].text].colour
    }
    let sorted = false
    if (tops.length === 0)
    {
      sorted = true
    }
    while(sorted === false)
    {
      let counter = 0
    for(let x=0;x<tops.length - 1;x++)
      {
        colour1 = tops[x].colour.split(',')
        colour2 = tops[x + 1].colour.split(',')
        if (parseInt(colour1[1]) > parseInt(colour2[1]))
        {
          let copy = _.cloneDeep(tops[x])
          tops[x] = tops[x+1]
          tops[x+1] = copy
          //console.log('takethel')
        }
        else
        {
          counter+= 1
        }
      }
      if (counter === tops.length - 1)
      {
        sorted = true
      }
    }
    let keys = Object.keys(data)
    this.setState({
      subjects : tops
    })
    data[this.state.currentTopic]["subjects"] = tops
    
    try{
    await AsyncStorage.setItem('topics', JSON.stringify(data))
    }
    catch(e){}
  }

    
  async componentDidMount() {
    //await AsyncStorage.clear()
    //console.log(Date.now())
    //console.log("hiya")
    //console.log(this.state.currentData)
    let obj = null
    let tops = []
    let subjects = []
    let topic = null
    try
    {
      topic = await AsyncStorage.getItem("topics")
    }
    catch (e){
      //console.log(tops)
    }
    //console.log("woezeers")
      topic = JSON.parse(topic)
      //console.log(topic)
      let colour = null
      let topics = topic[this.state.currentTopic] 
      subjects = []
      for(let i=0;i<topics["subjects"].length;i++)
      {
          topics["subjects"][i].colour = topic[topics["subjects"][i].text].colour
          subjects.push(topics["subjects"][i])
      }
      let sorted = false
      if(subjects.length  === 0)
      {
        sorted = true
      }
      while(sorted === false)
      {
        let counter = 0
      for(let x=0;x<subjects.length - 1;x++)
      {
        colour1 = subjects[x].colour.split(',')
        colour2 = subjects[x + 1].colour.split(',')
        if (parseInt(colour1[1]) > parseInt(colour2[1]))
        {
          let copy = _.cloneDeep(subjects[x])
          subjects[x] = subjects[x+1]
          subjects[x+1] = copy
          //console.log('takethel')
        }
        else
        {
          counter+=1
        }
      }
      if (counter === subjects.length - 1)
      {
        sorted = true
      }
      }

      for(let j=0;j<topics["topics"].length;j++)
      {
        tops.push(topics["topics"][j])
      }
      //console.log(topic)
    //console.log(topic)
    this.setState({
      data:topic,
      topics : tops,
      subjects: subjects
    })
    this.SwitchData()
    this.CalcDecay()
    //console.log(this.state.data)
    //console.log(this.state.currentTopic)
    //console.log(tops)
    if (this.state.topics !== null)
    {
      async () => this.CalcDecay()
    }
      
    const StateChange = this.props.navigation.addListener('focus', this.CalcDecay())
  }

  CreateAlert(item, type){
    Alert.alert(
      "Are You Sure?",
      "This Deletion is Irreversible",
      [
        {
          'text' : 'Cancel',
          style:"cancel"
        },
        {
          'text' : 'OK',
          onPress:() => this.DeleteTopic(item, type)
        }
      ],
      { cancelable: true }
    )
  }

  async DeleteTopic(name, type) {
    let index = null
    let topics = this.state.topics
    let tops = []
    let subs = []
    try{
      data = JSON.parse(await AsyncStorage.getItem('topics'))
    }
    catch(e)
    {
    }
    if (type === "subjects")
    {
      topics = data[this.state.currentTopic]["subjects"]
    }
    else
    {
      topics = data[this.state.currentTopic]["topics"]
    }
    for (let i=0;i<topics.length;i++)
    {
      // console.log('1')
      //   console.log(name[0])
      //   console.log('2')
      // console.log(topics)
      if(type === "topics")
      {
        if(topics[i].name[0] === name[0])
        {
          index = i
        }
      }
      else
      {
        // console.log('text')
        // console.log(topics[i].text)
        // console.log('name')
        // console.log(name)
        if(topics[i].text === name)
        {
          index = i
        }
      }
    }
    //console.log(index)
    //console.log(topics)
    let newTopics = topics
    //console.log(name)
    //console.log(newTopics.slice(0,index))
    //console.log(type)
    data[this.state.currentTopic][type] = newTopics.slice(0, index).concat(newTopics.slice(index + 1, newTopics.length))
    if (type === "subjects")
    {
      //console.log(topics[index])
      delete data[topics[index]]
    }
    //console.log('gangshit')
    //console.log(data)
    let top = data[this.state.currentTopic]["topics"]
    //console.log(data)
    //console.log(top)
    let sub = data[this.state.currentTopic]["subjects"]
    //console.log(topics)
    try{
      await AsyncStorage.setItem('topics', JSON.stringify(data))
    }
    catch(e)
    {
    }
    this.setState({
      topics: top,
      subjects: sub,
      data:data
    })
    //console.log(this.state.topics)
  }

  async CalcDecay() {
    this.CalcSubjectDecay()
    let data = this.state.data
    //console.log('hi')
    //console.log('wassup')
    
    let colour = null
    let topics = this.state.topics
    //console.log('likemike')
    //console.log('iwannabelikemike')
    //console.log(this.state.topics)
    for (let i = 0;i < this.state.topics.length; i++)
    {
      //console.log('gobaby')
      let newColour = topics[i].colour.split(',')
      newColour[0] = newColour[0].split('(')[1]
      const time = Date.now()
      const day = 3
      //console.log(this.state.currentTopic)
      let timeStart = topics[i].timeStart
      let visualDiff = newColour[0]
      let diff = ((time - timeStart) / 1000) * this.state.conversion
      let newDiff = diff - visualDiff
      // console.log("stackpapertotheceiling")
      // console.log(newDiff)
      // console.log("paper")
      // console.log(diff)
      // console.log(this.state.conversion)
      let green =  parseInt(newColour[1]) - newDiff
      let red = parseInt(newColour[0]) + newDiff
      let sm2_percentOfInterval = (Date.now() - topics[i].sm2_timeStart) / (60*60*24*topics[i].interval)
      let sm2_red = sm2_percentOfInterval * 255
      let sm2_green = 255-sm2_red
      //let sm2_colour = [red, 255 - red, 20]
      let sm2_colour = `rgb(${sm2_red},${sm2_green}, 40) `
      // console.log('twice')
      // console.log(newColour)
      if (green > 255)
      {
        green = 255
      }
      if (red > 255)
      {
        red = 255
      }
      if (green < 0)
      {
        green = 0
      }
      if (red < 0)
      {
        red = 0
      }
      //console.log("once")
      colour =  `rgb(${red},${green},40)`
      // console.log('changes')
      // console.log(colour)
      topics[i].colour = colour
      topics[i].sm2_colour = sm2_colour
      topics[i].changeColour = 'rgb(0,255,0)'
      topics[i].timeStart = timeStart

    }
    let sorted = false
    if(topics.length === 0)
    {
      sorted = true
    }
    // console.log('miayao')
    // console.log(topics)
    while(sorted === false)
    {
      let counter = 0
    for(let i=0; i<topics.length - 1; i++)
    {
      if (topics[i].timeStart > topics[i + 1].timeStart)
      {
          let copy = _.cloneDeep(topics[i])
          topics[i] = topics[i + 1]
          topics[i + 1] = copy
      }
      else
      {
        counter+=1
      }
        
    }

    if (counter === topics.length - 1)
    {
      sorted = true
    }
  }
  //console.log(topics)
    if (topics !== null && this.state.currentTopic !== undefined )
    {
      // console.log('bighunny')
      // console.log(data)
      // console.log(this.state.currentTopic)
        data[this.state.currentTopic]["topics"] = topics
        let subjects = data[this.state.currentTopic]["subjects"]
        this.setState({
          topics : topics,
          subjects : subjects,
          data : data
        })
        try{

          await AsyncStorage.setItem('topics', JSON.stringify(data))
        }

        catch (e){
        }
    }
  }

  HandleFlatlist(value)
  {
    this.setState({
      switch: value
    })
  }

  async ColourChange(name, rgb, value) {
    let index=null
    let newColour = [0,0]
    newColour[0] = value
    newColour[1] = 255-value
    let topics = this.state.topics
    //console.log(topics)
    for (let i=0;i<topics.length;i++)
    {
      //console.log(i)
      if(topics[i].name === name)
      {

        index = i
      }
    }

    let realColour = `rgb(${newColour[0]},${newColour[1]},0)`
    
    topics[index].changeColour = realColour
    let data = this.state.data
    data[this.state.currentTopic]["topics"] = topics
    this.setState({
      topics : topics,
      data : data
    })
    try
    {
      await AsyncStorage.setItem('topics', JSON.stringify(data))
    }
    catch(e)
    {}
  }


  componentDidUpdate() {
  this.SwitchData()
  }

  SwitchData(){
    let currentData = null
    //console.log("datat a")
    if (this.state.switch)
    {
      currentData = this.state.topics
    }
    else
    {
      currentData = this.state.subjects
    }
    if (currentData !== this.state.currentData)
    {
      this.setState({
        currentData: currentData
      })
    }
    //console.log(currentData)
  }


  


  render() {
    // maybe add in a little bit of blue to make text readable
    // look at a colour wheel for reference
    //console.log(this.state.topics)
    return (
      <View style={{flex : 1}}>
        <Switch
        trackColor={{ false: "blue", true: "green" }}
        ios_backgroundColor="#3e3e3e"
        onValueChange={(value) => {this.HandleFlatlist(value)}}
        value={this.state.switch}
      />
        <Text>{this.state.currentTopic}</Text>
        <TextInput onChangeText={(text) => this.HandleInput(text, "topic")} onSubmitEditing={() => this.SubmitInput("topic")} placeholder="Add A Topic"></TextInput>
        <TextInput onChangeText={(text) => this.HandleInput(text, "subject")} onSubmitEditing={() => this.SubmitInput("subject")} placeholder="Add A Subject"></TextInput>
        <FlatList style={{flex : 1}}
          extraData={this.state}
          data = {this.state.currentData}
          keyExtractor = {(item ,index) => index.toString()}
          renderItem = {({item}) => 
          
          { 
            if(this.state.switch)
            {
            return (
            <View style={{margin:20}}>
            <View style={{backgroundColor: item.colour}}>
            <Text style={{fontSize:35, textAlign: 'center'}}>{item.name}</Text>
            </ View>
            <Slider
            minimumValue={0}
            maximumValue={255}
            onValueChange={(value) => {this.ColourChange(item.name, item.changeColour, value)}}
            minimumTrackTintColor='rgb(255,0,0)'
            maximumTrackTintColor='rgb(0,255,0)'
              />
            <Button color = {item.changeColour} onPress={() => {this.Reset(item.name, item.changeColour)}} title="Revised?"></Button>
            <View>
            <Button onPress={() => {this.CreateAlert(item.name,"topics" )}} title="Delete This Topic"></Button>
            </View>
            </View>
            )
            }
            else
            {
              return (
                <View style={{margin:20}}>
                <View style={{backgroundColor: item.colour}}>
                <Text style={{fontSize:35, textAlign: 'center'}}>{item.text}</Text>
                </ View>
                <Button title={"View "+ item.text + "'s Topics" } onPress={() => this.NavigateSubject(item.text)}></Button>
                <View>
                <Button onPress={() => {this.CreateAlert(item.text, "subjects")}} title="Delete This Topic"></Button>
                </View>
                </View>
              )}

          }}
          />
      </View>
    )
  }
}

class OrderedTopics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      regular : false,
      switch : false,
      months : {0 : "January", 1: "Feburary", 2:"March", 3:"April", 4:"May", 5:"June", 6:"July", 7:"August", 8:"September", 9:"October", 10:"November", 11 :"December"},
      days : {0 : "Sunday", 1 : "Monday", 2 : "Tuesday", 3 : "Wednesday", 4 : "Thursday", 5 : "Friday", 6 : "Saturday"}
      
    }
  }
  async CalcLargestDecay() {
    let topics = null
    regular = this.state.regular
    try
    {
      topics = JSON.parse(await AsyncStorage.getItem('topics'))
    }
    catch(e){}
    let keys = Object.keys(topics)
    // console.log(keys)
    let worstScore = Infinity
    let worstTopic = null
    // console.log("endless")
    // console.log(topics)
    // console.log(keys)
    let realTopics = []
    for(i=0;i<keys.length;i++)
    {
      let keysT = Object.keys(topics[keys[i]]["topics"])
      for(j=0;j<keysT.length;j++)
      {
        let topic = topics[keys[i]]["topics"][keysT[j]]
        realTopics.push(topic)
      }
    }
    let sorted = false
    // console.log('mariah')
    // console.log(realTopics)
    while(sorted === false)
    {
      let counter = 0
      // console.log('sorted')
      // console.log(counter)
      // console.log(realTopics.length)
      for (f=0;f<realTopics.length - 1;f++)
      {
        timeTillReview =  (realTopics[f].sm2_timeStart + (60*60*24 * realTopics[f].interval * 1000)) - Date.now()
        timeTillReview2 =  (realTopics[f+1].sm2_timeStart + (60*60*24 * realTopics[f+1].interval * 1000)) - Date.now()

        if((realTopics[f].timeStart > realTopics[f + 1].timeStart && regular) || (timeTillReview > timeTillReview2 && !regular) )
        {
          let copy = _.cloneDeep(realTopics[f])
          realTopics[f] = realTopics[f + 1]
          realTopics[f + 1] = copy
        }
        else
        {
          counter+=1
          // console.log(counter)
          // console.log(realTopics[f].timeStart)
          // console.log(realTopics[f+1].timeStart)
        }
      }
      if(counter ===  realTopics.length - 1)
      {
        // console.log("entered")
        sorted = true
        // console.log(counter)
        // console.log(realTopics.length - 1)
      }
    
    }
    // //shoud work, perhaps add if conditions to determine whether to display week days minutes  
    // console.log("yoB it's my tiem")
    // console.log(regular)
    for(x=0;x<realTopics.length;x++)
    {
      if(regular)
      {
        let seconds = Math.round((Date.now() - realTopics[x].timeStart) / 1000)
        let minutes = Math.round(seconds / 60)
        let hours = Math.round(seconds / 3600)
        let days = Math.round(seconds / (24 * 3600))
        let formatedTime = null
        let text = "You haven't revised this in"
        if(days > 0)
        {
          formatedTime = (`${text} ${days} Days `)
        }
        else if (hours > 0)
        {
          formatedTime = (`${text} ${hours} Hours`)
        }
        else if (minutes > 0)
        {
          formatedTime = (`${text} ${minutes} Minutes`)
        }
        else
        {
          formatedTime = (`${text} ${seconds} Seconds`)
        }
        realTopics[x].formatedTime = formatedTime
        console.log("ohyerah")
        console.log(realTopics[x].displayedColour)
        realTopics[x].displayedColour = realTopics[x].colour
      }
      else
      {
        let seconds = Math.round((Date.now() - realTopics[x].sm2_timeStart) / 1000)
        let minutes = Math.round(seconds / 60)
        let hours = Math.round(seconds / 3600)
        let days = Math.round(seconds / (24 * 3600))
        //let formatedTime = `in ${days} Days`
        //console.log()
        // let date = new Date()
        // let dig_day = date.getDate()
        // let dig_month = date.getMonth()
        // let str_month = this.state.months[dig_month]
        let dateNow = new Date()
        let dayNow = dateNow.getDate()
        let monthNow = dateNow.getMonth()
        let yearNow = dateNow.getFullYear()
        let dateAfterInterval = new Date(realTopics[x].sm2_timeStart + (realTopics[x].interval * 60 * 60 * 24 * 1000))
        let dig_day = dateAfterInterval.getDate()
        let dig_month = dateAfterInterval.getMonth() + 1
        let dig_weekDay = dateAfterInterval.getDay()
        let dig_year = dateAfterInterval.getFullYear()
        let str_weekDay = this.state.days[dig_weekDay]
        let formatedTime = `You should revise this on ${str_weekDay} ${dig_day}/${dig_month}/${dig_year}`        //let str_month = this.state.months[dig_month]
        // if(dig_month === monthNow && dig_year === yearNow)
        // {
        //   if((dig_day - dayNow) === 0)
        //   {
        //     formatedTime = "You should revise this Today"
        //   }
        //   else if((dig_day - dayNow) === 1)
        //   { 
        //     formatedTime = "You should revise this Tomorrow"
        //   }
        // }
        realTopics[x].formatedTime = formatedTime
        realTopics[x].displayedColour = realTopics[x].sm2_colour
      }
    }
    this.setState({
      topics : realTopics
    })
  }
  HandleFlatlist(value)
  {
    this.setState({
      switch: value,
      regular : !value
    })
    this.CalcLargestDecay()
    //navigation.navigate("Topics")
  }
  async componentDidMount()
  {
    this.CalcLargestDecay()
     const TitlesChange = this.props.navigation.addListener('focus', async () => {
      this.CalcLargestDecay()
    })
  }
    render() {
      // maybe add in a little bit of blue to make text readable
      // look at a colour wheel for reference
      return (
        <View style={{flex : 1}}>
        <Switch
        trackColor={{ false: "blue", true: "green" }}
        ios_backgroundColor="#3e3e3e"
        onValueChange={(value) => {this.HandleFlatlist(value)}}
        value={this.state.switch}
      />
          <Text>{this.state.currentTopic}</Text>
          <FlatList style={{flex : 1}}
            extraData={this.state}
            data = {this.state.topics}
            keyExtractor = {(item ,index) => index.toString()}
            renderItem = {({item}) => 
              <View style={{margin:20, backgroundColor : item.displayedColour}}>
                <Text style={{fontSize:35, textAlign: 'center'}}>{item.name}</Text>
                <Text style={{fontSize:25, textAlign: 'center'}}>{item.formatedTime}</Text>
              </View>
      }
            




/>
</View>
      )}}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red'
  }
})

const inline = StyleSheet.create({
  container: {
    flexDirection : 'row'
  }
})

//topics = {"Physics" : {"parent" : null, "topics": null ,"subjects" : ["Physics Paper 1" , "Physics Paper 2"]} , "Physics Paper 1" : {"parent" : "Physics" , "subjects" : null , "topics" :["Moments", "Projectile Motion", "Momentum and Force", "Work, Energy and Power", "Materials", "Stars", "Particle Physics"]}, "Physics Paper 2" : {"parent" : "Physics", "subjects" : null, "topics" : ["Circuits" , "Waves", "Lasers" ]}, "Further Maths" : {"parent" : null, "topics" : null, "subjects" : ["FP1", "FS1" , "FM1"]}, "FP1" : {"parent" : "Further Maths", "subjects" : null, "topics" : ["Complex Numbers", "Matrices", "Roots, Series, Summation", "Further Vectors"]}, "FS1" : {"parent" : "Further Maths", "subjects" : null, "topics" : ["Discrete Distributions", "Poisson Distributions" ,"Chi Squared Test 1" ,"Chi Squared Test 2"]}, "FM1" : {"parent" : "Further Maths", "subjects" : null, "topics" : ["Momentum", "Energy" , "Collisons"]}, "Maths" : {"parent" : null, "topics" : null, "subjects" : ["Pure" , "Statistics", "Mechanics"]}, "Pure" : {"parent": "Maths", "subjects" : null, "topics" : ["Solving Quadratics", "Coordinate Geometry", "Trigonometry" , "Polynomials", "Binomials Expansion", "Transformations and Graphs", "Differentiation" , "Integration", "Vectors", "Logarithms"]}, "Statistics" : {"parent" : "Maths", "subjects" : null, "topics" : ["Data", "Hypothesis Testing"]}, "Chemistry" : {"parent" : null, "topics" : null, "subjects" : ["Chemistry Paper 1" , " Chemistry Paper 2"]}, "Chemistry Paper 1" : {"parent" : "Chemistry", "subjects" : null, "topics" : ["Basics, Atoms, Electrons", "Calculations" , "Bonding and Structures", "Periodicity", "Equilibrium Reactions and Acid-Base"]}, "Chemistry Paper 2" : {"parent" : "Chemistry", "subjects" : null, "topics" : ["Energy", "Rates of Reaction", "Impacts of Chemistry", "Hydrocarbons", "Halogenoalkanes", "Alcohols", "Carboxylic Acids", "Spectrosopy"]}}

// class Topic_SM2 extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       textT : '',
//       textS : '',
//       timeStart : 0,
//       yellow : 3,
//       red : 7,
//       colour : 'green',
//       data : [],
//       currentTopic: this.props.route.params.topic,
//       dampingFactor : 0.7,
//       subjects : [],
//       topics: [],
//       currentData : null,
//       switch : false,
//       conversion : 255 /(2*60*60*24*7)
//       easing_factor : 2.5,
//       interval : 1,
//       repetitions : 0
      
//     }

//   }
export function mockAskQuestion(question){
  return new Promise((res)=>{
    setTimeout(()=>{
      res({ id: Date.now().toString(), question, answer: "This is a mocked legal-style answer for: "+question })
    }, 700)
  })
}
export function mockGetHistory(){
  return new Promise((res)=>{
    setTimeout(()=>{
      res([
        {id:'1', question:'What is Right to Information?', answer:'RTI is ...'},
        {id:'2', question:'How to file a FIR?', answer:'To file an FIR...'},
      ])
    },300)
  })
}
export function mockGetTopics(){
  return new Promise((res)=>{
    setTimeout(()=>{
      res(['Fundamental Rights','Directive Principles','Emergency Provisions','Amendment Process'])
    },200)
  })
}

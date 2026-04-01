from database import topics_collection, Topic
from typing import List, Dict, Optional
from datetime import datetime
from bson import ObjectId

class TopicsService:
    @staticmethod
    def initialize_default_topics():
        """Initialize default constitutional topics"""
        default_topics = [
            {
                "title": "Fundamental Rights",
                "description": "Basic rights guaranteed to all citizens of India",
                "content": "(Source: Part III, Article 12-35) The Fundamental Rights include:\n\n1. Right to Equality (Article 14-18): Guarantees equality before the law and prohibits discrimination.\n2. Right to Freedom (Article 19-22): Includes freedom of speech, assembly, and protection of life and personal liberty.\n3. Right against Exploitation (Article 23-24): Prohibits human trafficking, forced labor, and child labor.\n4. Right to Freedom of Religion (Article 25-28): Guarantees the right to practice and propagate religion.\n5. Cultural and Educational Rights (Article 29-30): Protects the interests of minorities.\n6. Right to Constitutional Remedies (Article 32): Allows citizens to move the Supreme Court for enforcement of rights."
            },
            {
                "title": "Directive Principles",
                "description": "Guidelines for the government to establish social and economic democracy",
                "content": "(Source: Part IV, Article 36-51) Directive Principles of State Policy (DPSP) are non-justiciable but fundamental in the governance of the country. They aim to create a social order based on justice, liberty, equality, and fraternity. Key principles include:\n\n- Article 39A: Equal justice and free legal aid.\n- Article 40: Organization of village panchayats.\n- Article 44: Uniform Civil Code for the citizens.\n- Article 45: Provision for early childhood care and education."
            },
            {
                "title": "Fundamental Duties",
                "description": "Moral obligations of citizens to promote patriotism and unity",
                "content": "(Source: Part IV-A, Article 51A) Added by the 42nd Amendment Act (1976), these duties are intended to remind citizens that while they enjoy rights, they also have responsibilities toward the nation. Citizens are expected to:\n\n- Abide by the Constitution and respect the National Flag and Anthem.\n- Cherish and follow the noble ideals of the freedom struggle.\n- Protect the sovereignty, unity, and integrity of India.\n- Promote harmony and common brotherhood.\n- Safeguard public property and abjure violence."
            },
            {
                "title": "Union Executive",
                "description": "The President, Vice-President, Prime Minister and Council of Ministers",
                "content": "(Source: Part V, Chapter I, Article 52-78) The Union Executive is responsible for the administration of the country. \n\n- The President (Article 52): The nominal head of the state. All executive actions are taken in their name.\n- The Vice-President (Article 63): Second highest constitutional office; ex-officio Chairman of the Rajya Sabha.\n- Council of Ministers (Article 74): Headed by the Prime Minister, they aid and advise the President."
            },
            {
                "title": "Parliament of India",
                "description": "The supreme legislative body consisting of Lok Sabha and Rajya Sabha",
                "content": "(Source: Part V, Chapter II, Article 79-122) India follows a bicameral legislative system:\n\n- Rajya Sabha (Article 80): The Council of States (Upper House), representing states and Union Territories.\n- Lok Sabha (Article 81): The House of the People (Lower House), directly elected by citizens.\n- Powers: Law-making, control over the executive via motions, and financial control."
            },
            {
                "title": "The Judiciary",
                "description": "The integrated judicial system with the Supreme Court at the apex",
                "content": "(Source: Part V & VI) India has a single integrated judicial system:\n\n- Supreme Court (Article 124-147): The highest court of appeal and guardian of the Constitution.\n- High Courts (Article 214-231): The principal civil courts of original jurisdiction in each state.\n- Subordinate Courts: District and sessions courts providing justice at the local level."
            },
            {
                "title": "Indian Legal Codes (2023)",
                "description": "A summary of the new criminal laws (BNS, BNSS, BSA)",
                "content": "(Source: Ministry of Law & Justice, 2023) The Indian Parliament overhauled the colonial-era legal system with three new acts that came into effect on July 1, 2024:\n\n1. Bharatiya Nyaya Sanhita (BNS): Replaces Indian Penal Code (IPC).\n2. Bharatiya Nagarik Suraksha Sanhita (BNSS): Replaces Code of Criminal Procedure (CrPC).\n3. Bharatiya Sakshya Adhiniyam (BSA): Replaces Indian Evidence Act."
            },
            {
                "title": "Bharatiya Nyaya Sanhita (BNS)",
                "description": "The new criminal code replacing the Indian Penal Code (IPC)",
                "content": "(Source: BNS, 2023) Key features Include:\n\n- Community Service: Introduced as a new form of punishment for minor offenses.\n- Specific Offenses: Explicitly defines terrorism, organized crime, and mob lynching.\n- Gender Neutrality: Criminalizes sexual acts under deception or false promises of marriage.\n- Sedition: Repealed and replaced by Section 150 (Acts endangering sovereignty)."
            },
            {
                "title": "Bharatiya Nagarik Suraksha Sanhita (BNSS)",
                "description": "New procedural law replacing the Code of Criminal Procedure (CrPC)",
                "content": "(Source: BNSS, 2023) Focuses on efficiency and forensic use:\n\n- Zero FIR: Allows an FIR to be filed at any police station regardless of jurisdiction.\n- Forensics: Mandates forensic evidence collection for offenses punishable by 7+ years of imprisonment.\n- Timelines: Sets strict deadlines for filing chargesheets and delivering judgments.\n- Digital Evidence: Formalized the use of digital technology in investigation and trials."
            },
            {
                "title": "Bharatiya Sakshya Adhiniyam (BSA)",
                "description": "New evidence law replacing the Indian Evidence Act",
                "content": "(Source: BSA, 2023) Modernizes the law of evidence for the digital age:\n\n- Digital Records: Electronic and digital records are now clearly defined as 'documents'.\n- Primary Evidence: Expands the definition to include digital records stored in multiple places.\n- Secondary Evidence: Allows for oral evidence regarding the contents of documents in certain cases."
            },
            {
                "title": "Center-State Relations",
                "description": "Legislative, administrative, and financial relations",
                "content": "(Source: Part XI & XII, Article 245-300) Defines the distribution of power between the Union and the States:\n\n- Seventh Schedule: Contains the Union List, State List, and Concurrent List.\n- Finance Commission (Article 280): Recommendations on distribution of tax revenue between Center and States."
            },
            {
                "title": "Local Government",
                "description": "Panchayati Raj and Municipalities",
                "content": "(Source: Part IX & IX-A) Introduced by the 73rd and 74th Amendment Acts (1992):\n\n- Panchayati Raj (Article 243-243O): Three-tier system for rural governance.\n- Municipalities (Article 243P-243ZG): Urban local governance bodies."
            },
            {
                "title": "Emergency Provisions",
                "description": "Special powers of the President during crises",
                "content": "(Source: Part XVIII, Article 352-360) Deals with exceptional situations:\n\n1. National Emergency (Article 352): Due to war, external aggression, or armed rebellion.\n2. President's Rule (Article 356): Failure of constitutional machinery in a State.\n3. Financial Emergency (Article 360): Threat to financial stability of India."
            },
            {
                "title": "Constitutional Amendment",
                "description": "Procedures for changing the Constitution",
                "content": "(Source: Part XX, Article 368) Parliament can amend the Constitution via:\n\n- Simple Majority: Like ordinary laws for certain cases.\n- Special Majority: 2/3rds of members present and voting.\n- Special Majority + State Ratification: Required for federal provisions."
            },
            {
                "title": "Election Commission",
                "description": "The body responsible for conducting free and fair elections",
                "content": "(Source: Part XV, Article 324) An independent body to ensure democratic integrity. It supervises elections to the Parliament, State Legislatures, and offices of the President and Vice-President."
            },
            {
                "title": "GST Council",
                "description": "A constitutional body for the Goods and Services Tax",
                "content": "(Source: Article 279A) Introduced by the 101st Amendment Act. It is a joint forum of the Center and States to make recommendations on tax rates, exemptions, and thresholds for GST."
            }
        ]
        
        for topic_data in default_topics:
            # Check if this specific topic already exists
            if not topics_collection.find_one({"title": topic_data["title"]}):
                topic = Topic(topic_data["title"], topic_data["description"], topic_data["content"])
                topic_doc = {
                    "title": topic.title,
                    "description": topic.description,
                    "content": topic.content,
                    "created_at": topic.created_at
                }
                topics_collection.insert_one(topic_doc)
    
    @staticmethod
    def get_all_topics() -> List[Dict]:
        topics = topics_collection.find().sort("title", 1)
        
        return [
            {
                "id": str(topic["_id"]),
                "title": topic["title"],
                "description": topic["description"],
                "content": topic["content"],
                "created_at": topic["created_at"]
            }
            for topic in topics
        ]
    
    @staticmethod
    def get_topic_by_id(topic_id: str) -> Optional[Dict]:
        try:
            topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
            
            if topic:
                return {
                    "id": str(topic["_id"]),
                    "title": topic["title"],
                    "description": topic["description"],
                    "content": topic["content"],
                    "created_at": topic["created_at"]
                }
            return None
        except:
            return None
    
    @staticmethod
    def search_topics(query: str) -> List[Dict]:
        import re
        safe_query = re.escape(query)
        regex = re.compile(f".*{safe_query}.*", re.IGNORECASE)
        search_query = {
            "$or": [
                {"title": regex},
                {"description": regex},
                {"content": regex}
            ]
        }
        topics = topics_collection.find(search_query).sort("title", 1)
        
        return [
            {
                "id": str(topic["_id"]),
                "title": topic["title"],
                "description": topic["description"],
                "content": topic["content"],
                "created_at": topic["created_at"]
            }
            for topic in topics
        ]
    
    @staticmethod
    def add_topic(title: str, description: str, content: str) -> Dict:
        topic = Topic(title, description, content)
        topic_doc = {
            "title": topic.title,
            "description": topic.description,
            "content": topic.content,
            "created_at": topic.created_at
        }
        result = topics_collection.insert_one(topic_doc)
        return {
            "success": True,
            "id": str(result.inserted_id),
            "message": "Topic added successfully"
        }

    @staticmethod
    def update_topic(topic_id: str, title: str = None, description: str = None, content: str = None) -> Dict:
        try:
            update_data = {}
            if title is not None: update_data["title"] = title
            if description is not None: update_data["description"] = description
            if content is not None: update_data["content"] = content
            
            result = topics_collection.update_one(
                {"_id": ObjectId(topic_id)},
                {"$set": update_data}
            )
            if result.matched_count == 0:
                return {"success": False, "message": "Topic not found"}
            return {"success": True, "message": "Topic updated successfully"}
        except Exception as e:
            return {"success": False, "message": f"Error: {str(e)}"}

    @staticmethod
    def delete_topic(topic_id: str) -> Dict:
        try:
            result = topics_collection.delete_one({"_id": ObjectId(topic_id)})
            if result.deleted_count == 0:
                return {"success": False, "message": "Topic not found"}
            return {"success": True, "message": "Topic deleted successfully"}
        except Exception as e:
            return {"success": False, "message": f"Error: {str(e)}"}

# Delivery Team Meeting

**Date**: Rahul Roni + Delivery
**Participants**: Rahul, Roni
**Context**: Delivery team meeting with Rahul and Roni
**Duration**: 52m 33s
**Language**: english

---

## Transcript


**Roni**: _0.00s - 4.52s_ of discussions from which we were able to identify the specific modules that we can deliver and the stuff that we'll have to park for the next phase, right? So as part of that, what I've done is I've created a final DRD that calls out all these distinct pieces of what is in scope, what is out of scope, what all will be delivered, what are actors, users, journeys, and all those things. So I've shared that in two, three groups. Smita, I don't know if you're in any of those groups.

**Rahul**: _34.00s - 40.00s_ Let me check because I saw that on the other one that I had scheduled as a series today morning, but I didn't get a chance to completely look at it.

**Roni**: _43.76s - 47.76s_ You see a VBS pickup DRD final version 1.5?

**Rahul**: _47.76s - 48.76s_ Yes.

**Roni**: _48.76s - 49.76s_ So that's the final DRD.

**Rahul**: _49.76s - 50.76s_ Okay. And I was... All in one repository, right?

**Roni**: _52.76s - 53.76s_ We have it in a SharePoint repository. No, that is going to go into the Wurzel repository that Rahul is maintaining. So that is something, a separate piece that Rahul will walk the entire team through, especially the delivery team through, because we've been playing in and out with that. So he will like formally onboard you guys and give you an idea of how that is. But from a project status perspective, I have agreement from the business of what they want to do. It's just that based on my conversation with Ranjit, the kind of things we wanted to park, I need to get an agreement from them again for those two, three aspects. It's minor. It's nothing major. The overall scope that I have trimmed down for the solution pretty much stays the same. It's just some UI components we may not build, we may directly do it from a backend. One flow, which is a one-off flow, I need to confirm with the business if they are happy with without the add-on demo one, right? With that, the rest of the things, Ranjit has pretty much gone through, he's comfortable with it. And he also gave his comfort in being able to deliver that in a eight-week time frame. That is four weeks of discoveries that are whatever from an AI perspective that we do. And then week by week, a modular approach is picked up.

**Rahul**: _129.04s - 131.36s_ Sadly, I don't have access to that document yet. I haven't heard back from Ranjit, but I will ask him to share that with the group.

**Roni**: _134.64s - 135.64s_ Yeah, please.

**Rahul**: _135.64s - 137.64s_ Because that is very key for the SOW.

**Roni**: _137.64s - 138.64s_ Yes. So in that, he's put in the number of resources from a pod structure perspective. But we will need to identify, I mean, you guys will have to work together and identify who the right set of resources are for this. And since it's very time critical, I mean, needless to say, we don't have a lot of time in trying to find out who the resources. So Ranjit will be able to point the kind of skillset that we need. And then probably Smita will need your help to get those people on board.

**Rahul**: _168.84s - 169.84s_ Yeah, no, no. Once you share that with the skills, right, we'll go back and check who is available, if not, whom we can borrow. That's the second strategy that we can do, right there to do parallel. At least until we identify the next person, whatever, stopgap, right?

**Roni**: _184.24s - 185.24s_ Yeah.

**Rahul**: _185.24s - 194.56s_ So from their initial four week setup perspective, there is a solution architect, cloud architect, senior cloud lead, tech lead, DevOps lead that is required, or at least that's what Ranjit had list down as the people that are required. But again, all of those details are in his personal Excel, which he's not sharing with me. So once we get that, we can go with that. Now, the next step that we need to do is we need to get some technical person on board, like ASAP, like yesterday, for doing a technology discovery or a technical discovery as such, because there is one Maximus integration piece that we have to build. And there is a payment integration with Stripe that we have to build, like separate integrations, right? Apart from that, the rest of the data within the system stays within the system. There is no data that we are sending outside, there is no data we are sending back to Maximus. So today, we had a conversation earlier where we were trying to do a UI review, for which I've done a follow up session and sent an invite later in the day as well, wherein that Anu pointed out that we need to get a data model done as well. Just give me a second, one second, one second. Rony, has Jason seen anything that we have done?

**Roni**: _265.96s - 268.96s_ He's seen the previous flow. Yes. The new thing and the design, I have not shown him. Intentionally, we've not shown because the data on those designs, there are assumptions. The moment we show them design, they will pick on the data. They'll be like, this is not right, this is not right, this is not right. So I don't want it to go to that level.

**Rahul**: _284.96s - 289.96s_ So what they need to do next is do a data discovery or a data mapping exercise, whatever they call it, right, where we have to identify which are the, what are the exact entities from an HBL perspective, what are the data. That's where the data model design and everything will come in. So today, Anup went all guns blazing and he's like, I need a data model right now.

**Roni**: _306.96s - 308.96s_ Anup in 21 minutes. Yes.

**Rahul**: _310.96s - 319.96s_ So he made us onboard Kiran and Kristy to come and understand and see if a data model can be done and then probably take up the data modeling exercise or the discovery exercise with ACFS. So, so far I've given Kiran a high level download. I've given him access to the Miro board. He will be using the information that I have populated there as the baseline to do his data model design and stuff like that.

**Roni**: _338.96s - 340.96s_ A little too technical, outside my realm.

**Rahul**: _340.96s - 344.96s_ But he's going to work on that and 6pm we probably have a review also. So I don't know where that is heading, how far that has gone. But from a next steps perspective, we need A, a data discovery to be done and B, a technical discovery done, to be done from Maximus integration and the payment gateway integration perspective.

**Roni**: _358.96s - 359.96s_ Okay.

**Rahul**: _359.96s - 361.96s_ So all those should happen this week in the next couple of days.

**Roni**: _361.96s - 362.96s_ Yes. Once the data discovery is done, we have the actual data attributes, then we will be able to update the design. So Rahul has done a wonderful job. He has used the BRD and created those screens. So he's created the flow for the, for the freight forwarders and all, as well as the admin. But there are data areas that we need to fix. So we need to fix it with the proper data entries. So once we have the actual data attributes and stuff, that will become an input to Rahul's design system and he's going to update the screen. So currently from a layout perspective and flow perspective, it's okay. It's, it's doing its job. Once we get the right data in, then I think we will be in a position to take that to ACFS, show them as a screen design or whatever, whatever, and get their sign off on that. Because that will kind of be the milestone against which we will build the rest of the things. Right. So the idea is to be able to do that review with them by the end of this week. If we have this data discovery done in advance.

**Rahul**: _423.96s - 424.96s_ Yeah. How many attributes, if I can ask, because the support team will have some bandwidth, we can get them do that data mapping because whatever data that you are asking about containers, parking lot and load and payment.

**Roni**: _438.96s - 439.96s_ Right.

**Rahul**: _439.96s - 443.96s_ This team would have already have had the mapping in Salesforce today.

**Roni**: _443.96s - 444.96s_ Right.

**Rahul**: _444.96s - 445.96s_ That's what we are doing.

**Roni**: _445.96s - 446.96s_ Right.

**Rahul**: _446.96s - 450.96s_ We are migrating from Salesforce to OutSystems, but they should have that.

**Roni**: _450.96s - 451.96s_ Yeah.

**Rahul**: _451.96s - 454.96s_ The Salesforce system talks only in containers. We have to talk in shipments, which is a step after containers.

**Roni**: _458.96s - 459.96s_ After.

**Rahul**: _459.96s - 460.96s_ Then they may not have that. They don't have the visibility till then.

**Roni**: _462.96s - 468.96s_ However, we do need to tap into that information as well because there are container references, wholesale freight forwarder order references, which we need to pull in as an attribute to this shipment.

**Rahul**: _474.96s - 475.96s_ Hmm.

**Roni**: _475.96s - 479.96s_ So all of that needs to be done as part of the data discovery. And that is the immediate next step. So I'm assuming since Kiran and Christy have been pulled into this, we can take them with us for the data discovery. I will need that confirmation to be able to set up a call with William to go through the Maximus data and identify what all data attributes are we pulling in. Right. So that is the immediate next step. From a BRD perspective, I have the final version of the BRD. We have the final flows. And Rahul has done a set of the screens already, which we can use if we update the data. So from an understanding perspective, we can take you through the screen, show you how the flow is, what is expected to run. But once we have the data discovery, they will have the actual data points on it. And then we can take that to the customer. So if we get this...

**Rahul**: _522.96s - 523.96s_ Okay. So prerequisite to start the actual implementation will be data discovery and tech discovery or will it be part of the date week?

**Roni**: _530.96s - 532.96s_ No, that is now. So tech discovery can happen because once we get the data discovery, that is pretty much a good chunk of the tech discovery from a Maximus integration build perspective.

**Rahul**: _542.96s - 546.96s_ These two are not factored in our three-week discovery, right?

**Roni**: _546.96s - 549.96s_ So this is an effort that we are spending. The data discovery usually forms a part of the discovery. But since we never formally blend it in, this has come out as a very standout point because that is the only thing that is standing in our way from taking this design to the customer. Because we have...

**Rahul**: _565.96s - 567.96s_ I am talking more from a... See, we are achieving the outcome, but we are not charging them for this piece, which is a very critical piece. We have to embed that into the entire exercise is what I am trying to tell you.

**Roni**: _578.96s - 579.96s_ Right.

**Rahul**: _579.96s - 582.96s_ So whom are we planning for the data discovery? What are the names? Can you give me the names?

**Roni**: _584.96s - 591.96s_ Kiran and Kristy, but Smita, who are you suggesting? I need to see who is available, right? They may not... I need to talk to the R&D team to find out who is there. Otherwise, I have to talk to Manoj to find who can help at least here. If it is not a very huge exercise, they will have to help. I will see if Deepu is available. We can pull him because he's quick.

**Rahul**: _610.96s - 615.96s_ See, the problem is we have not onboarded any of these people, right?

**Roni**: _615.96s - 616.96s_ So...

**Rahul**: _616.96s - 617.96s_ That is the problem. So we cannot borrow for three or four days.

**Roni**: _621.96s - 624.96s_ Yeah, if it is just a day's thing, then fine.

**Rahul**: _626.96s - 628.96s_ No, availability is a problem.

**Roni**: _628.96s - 631.96s_ See, giving, billing, negotiation, that and all we can do later. But availability will be a challenge if we want people. I'll check with Manoj and come back.

**Rahul**: _637.96s - 638.96s_ Yeah.

**Roni**: _640.96s - 642.96s_ So, yeah, that's where we stand.

**Rahul**: _642.96s - 646.96s_ What will Kristy and Kiran be able to achieve?

**Roni**: _646.96s - 647.96s_ I don't know. I don't know. Kiran is very good from a business translation perspective. But data modeling... That's not what you want.

**Rahul**: _656.96s - 663.96s_ So, I have seen the other side of how he operates from a business translation, architecture, all of it, right? But I've not seen him from a data translation perspective.

**Roni**: _668.96s - 669.96s_ Sure. I'll see how you go.

**Rahul**: _670.96s - 672.96s_ I think they've got to connect in 15 minutes.

**Roni**: _674.96s - 675.96s_ Yeah, Smita... I'll check and come back.

**Rahul**: _676.96s - 678.96s_ So, Ronnie, question to you. If I get a person, should I circle back on the same meeting chat group with the person so that they can connect with you and start working tomorrow?

**Roni**: _687.96s - 688.96s_ Yeah, that should be fine. That should be fine.

**Rahul**: _689.96s - 690.96s_ Okay.

**Roni**: _690.96s - 691.96s_ Okay.

**Rahul**: _691.96s - 692.96s_ Okay.

**Roni**: _692.96s - 693.96s_ Right.

**Rahul**: _693.96s - 695.96s_ But prior to that, I think it's worth... I've sent you an invite for the 6 p.m., right? I mean, the one that starts in 15 minutes. Smita?

**Roni**: _700.96s - 701.96s_ No?

**Rahul**: _701.96s - 702.96s_ Let me forward that also.

**Roni**: _702.96s - 703.96s_ Right.

**Rahul**: _703.96s - 708.96s_ Because there, Kiran will be talking about the data model, or I hope he's talking about the data model. So, we'll get to know a state where he is currently right now and if he's able to achieve whatever Anup had in mind.

**Roni**: _717.96s - 718.96s_ Right?

**Rahul**: _718.96s - 724.96s_ If that's the case and if we can work with that, then we might as well continue with Kiran.

**Roni**: _725.96s - 726.96s_ Right?

**Rahul**: _726.96s - 727.96s_ But if that's not... It's not going in the right direction, then probably we will need that person. Because we had that conversation earlier and Ranjit was like, I don't have anyone ready right now. Balu was also like, we don't know who can do it right now. So, everybody kind of doesn't have visibility who can be plugged in immediately.

**Roni**: _744.96s - 748.96s_ I'll check with... 15 minutes I have time to talk to Smriti and come back.

**Rahul**: _748.96s - 752.96s_ You need a perfect data engineer to do the attribute mapping. That's the skill set that we want, correct?

**Roni**: _754.96s - 755.96s_ Yeah.

**Rahul**: _755.96s - 756.96s_ Yeah.

**Roni**: _756.96s - 757.96s_ Source and destination.

**Rahul**: _757.96s - 761.96s_ Smriti, since you asked about the complexity or how many attributes it has, I just gave you a rough estimate of how many entities do we have as well as what are the integrations required and what kind of number of fields that one has as well.

**Roni**: _777.96s - 779.96s_ Yeah, this is fair enough. The only problem I will have is not the number, the transformation that it needs to actually complete the business workflow. Okay, I can have 100, but if that 100 has to translate into 40 with a specific action, then that is a problem. And if it is dependent from multiple systems, again a problem. So, only the data engineer will break this down. The number may be like huge also, but if this transformation logic is very complex and for us to achieve this, that is where the actual problem is. Correct. And we have seen this many times. So, that's okay.

**Rahul**: _816.96s - 819.96s_ Now, we are sailing, we have to clean and sail. That's all.

**Roni**: _820.96s - 821.96s_ Yeah.

**Rahul**: _821.96s - 824.96s_ There is nothing, no going back, right?

**Roni**: _824.96s - 825.96s_ Only forward. Correct.

**Rahul**: _826.96s - 829.96s_ Right, so that's…

**Roni**: _829.96s - 835.96s_ Person who is in black, no, always signaling tough situations, very bad.

**Rahul**: _835.96s - 837.96s_ There are two people here in black. One who is talking, the other one who is just sitting and smiling.

**Roni**: _839.96s - 841.96s_ So, I am assuming you are talking about the smiling person.

**Rahul**: _841.96s - 845.96s_ Sitting person, smiling person.

**Roni**: _845.96s - 847.96s_ I can stop smiling.

**Rahul**: _847.96s - 852.96s_ But still you will be the black guy, don't worry.

**Roni**: _852.96s - 853.96s_ All good.

**Rahul**: _853.96s - 856.96s_ So, that's where we are from a VBS perspective. I hope that gives you enough sight, right?

**Roni**: _860.96s - 863.96s_ Next steps, tomorrow, heavy day again.

**Rahul**: _863.96s - 867.96s_ I will be working with Matt tomorrow to get that sign up on the BRD.

**Roni**: _867.96s - 869.96s_ No, we will work with you after Australia hours only. Because morning session is with them only, right?

**Rahul**: _872.96s - 873.96s_ Yeah. So, during the day, I hope I am able to get that time with Matt and get that thing signed off. Because once I get that thing signed off, at least from a business sign off perspective, we are good.

**Roni**: _883.96s - 888.96s_ But then, in the meanwhile, if we can identify the data person, plan for a data discovery, because I will need to set up time with William also.

**Rahul**: _890.96s - 891.96s_ No, no, no. That has to happen in parallel. It has to start next Monday.

**Roni**: _895.96s - 898.96s_ Okay, so then we will do two checkpoints every day, Ronnie. Otherwise, I am not very comfortable with the way that we are in today.

**Rahul**: _904.96s - 906.96s_ So, let's do that. I will draft the SOW based on whatever... Do you have any inputs now?

**Roni**: _912.96s - 913.96s_ For now, yes.

**Rahul**: _913.96s - 917.96s_ Exclusion of business process workflow, you will need to send it to me, Ronnie.

**Roni**: _917.96s - 918.96s_ I will send that. I will start drafting it.

**Rahul**: _920.96s - 922.96s_ Workflow diagram as well as the BRD. I will keep posting the interim version so you can do your reviews also parallelly than waiting at the end. Today evening, I will post a draft version for you.

**Roni**: _931.96s - 932.96s_ Right.

**Rahul**: _932.96s - 937.96s_ Also, Ronnie, do you have the view on the spreadsheet that Ranjit was working on?

**Roni**: _937.96s - 938.96s_ No, no, I need access. No, he needs to get access and share it with us.

**Rahul**: _941.96s - 942.96s_ Okay, okay, okay. Yeah, send that as well.

**Roni**: _944.96s - 946.96s_ Cool.

**Rahul**: _946.96s - 947.96s_ Okay.

**Roni**: _947.96s - 948.96s_ All good.

**Rahul**: _948.96s - 950.96s_ Then, in that case, thank you so much. I am happy to give you 10 minutes back before we jump on to the next call.

**Roni**: _953.96s - 954.96s_ Okay.

**Rahul**: _954.96s - 955.96s_ Ronnie, I need 10 minutes.

**Roni**: _955.96s - 957.96s_ Yeah, get me on to that 6 p.m. call, please.

**Rahul**: _957.96s - 959.96s_ I have already forwarded that to you.

**Roni**: _959.96s - 960.96s_ Okay, okay, fine.

**Rahul**: _960.96s - 965.96s_ Can we catch up for 5 minutes?

**Roni**: _965.96s - 966.96s_ Sure, sure.

**Rahul**: _966.96s - 967.96s_ Why not?

**Roni**: _967.96s - 968.96s_ I have just 10 minutes for that only.

**Rahul**: _968.96s - 969.96s_ Catch up.

**Roni**: _969.96s - 970.96s_ Let me share my screen.

**Rahul**: _970.96s - 972.96s_ You guys can drop off actually.

**Roni**: _972.96s - 973.96s_ Okay, bye.

**Rahul**: _973.96s - 974.96s_ See ya.

**Roni**: _974.96s - 975.96s_ Bye.

**Rahul**: _975.96s - 976.96s_ Bye. So, according to your new BRD, there are some gaps in the intent model, not in BRD, and some are missing from the BRD, which is like most of the things which you kind of deferred. So, payment entity. So, payment ID, booking ID, amount, gateway, status type, time zone. Is this something which we are building?

**Roni**: _999.96s - 1000.96s_ Okay.

**Rahul**: _1000.96s - 1007.96s_ I'm asking, is this something which we are going to be building?

**Roni**: _1007.96s - 1009.96s_ We will need to put in a payment entity, right?

**Rahul**: _1009.96s - 1014.96s_ Because with the booking as an entity, you will need to map the payments.

**Roni**: _1014.96s - 1017.96s_ Yeah, so this is going to be, what was that?

**Rahul**: _1017.96s - 1019.96s_ Compay or Stripe?

**Roni**: _1019.96s - 1020.96s_ Stripe.

**Rahul**: _1020.96s - 1024.96s_ For now, Stripe, but they, I don't know if they will keep going back and forth.

**Roni**: _1024.96s - 1025.96s_ Okay.

**Rahul**: _1025.96s - 1028.96s_ But go ahead with Stripe because Jason has said it's going to be Stripe.

**Roni**: _1028.96s - 1029.96s_ Sure.

**Rahul**: _1029.96s - 1031.96s_ Then I'll have to add the payment entity as well.

**Roni**: _1031.96s - 1033.96s_ Yes, that is it.

**Rahul**: _1033.96s - 1034.96s_ Cool.

**Roni**: _1034.96s - 1036.96s_ And user entity.

**Rahul**: _1036.96s - 1043.96s_ This is something which I haven't done because I didn't want to mess with the login first. Because we had some confusion regarding, like I had some confusion regarding SSO, SS username.

**Roni**: _1049.96s - 1052.96s_ So, I will add the user entity as well.

**Rahul**: _1053.96s - 1059.96s_ Booking HBL link as an explicit junction table. So, yeah, this is per HBL fee.

**Roni**: _1067.96s - 1071.96s_ So, that's a new addition, right?

**Rahul**: _1071.96s - 1073.96s_ Just wanted to confirm with you.

**Roni**: _1073.96s - 1075.96s_ Per HBL fee, yes.

**Rahul**: _1075.96s - 1076.96s_ Okay.

**Roni**: _1076.96s - 1079.96s_ They will need to probably add that to the HBL itself.

**Rahul**: _1079.96s - 1080.96s_ Okay.

**Roni**: _1081.96s - 1086.96s_ And site entity gets location and status attributes.

**Rahul**: _1086.96s - 1088.96s_ So, we have different sites.

**Roni**: _1088.96s - 1094.96s_ So, it has location based and status attributes, right?

**Rahul**: _1094.96s - 1098.96s_ From a site perspective, not really.

**Roni**: _1098.96s - 1100.96s_ It will be just a list of sites.

**Rahul**: _1100.96s - 1101.96s_ Okay.

**Roni**: _1102.96s - 1107.96s_ It makes, you know, we have to consider it because... In the backend, they will need to create a table or something for site and treat site as an entity.

**Rahul**: _1113.96s - 1114.96s_ So, that way it is correct.

**Roni**: _1114.96s - 1115.96s_ Exactly.

**Rahul**: _1115.96s - 1116.96s_ Yeah, because...

**Roni**: _1116.96s - 1119.96s_ But there is no special location data and stuff that goes.

**Rahul**: _1119.96s - 1121.96s_ Yeah, because sometimes these slots are per site.

**Roni**: _1121.96s - 1123.96s_ Slots are per site, right?

**Rahul**: _1123.96s - 1124.96s_ Yes.

**Roni**: _1124.96s - 1126.96s_ So, in that case, the entity is required.

**Rahul**: _1126.96s - 1127.96s_ Hmm.

**Roni**: _1130.96s - 1132.96s_ So, yeah, I will go ahead and create that. So, Maximus is an external system participant.

**Rahul**: _1140.96s - 1143.96s_ So, it's not an integration.

**Roni**: _1147.96s - 1150.96s_ It's an external system, but we will need to do an integration to get that data.

**Rahul**: _1150.96s - 1151.96s_ Okay.

**Roni**: _1151.96s - 1152.96s_ So, and then... That integration is via MuleSort.

**Rahul**: _1153.96s - 1157.96s_ So, what can Maximus do other than just giving us data?

**Roni**: _1158.96s - 1159.96s_ That's it. It's a system of record.

**Rahul**: _1161.96s - 1162.96s_ Okay. Okay.

**Roni**: _1173.96s - 1176.96s_ Yeah, so, I will update this. I will update my intent model based on... I mean, this is on me, actually.

**Rahul**: _1183.96s - 1184.96s_ Okay.

**Roni**: _1184.96s - 1191.96s_ So, if I don't update it, then I can't create the screens and then the data I give the developers also kind of differs.

**Rahul**: _1191.96s - 1193.96s_ So, I will make the changes.

**Roni**: _1193.96s - 1194.96s_ Yes. And I will make the changes in the UI as well.

**Rahul**: _1197.96s - 1198.96s_ Okay.

**Roni**: _1198.96s - 1199.96s_ Fair enough.

**Rahul**: _1199.96s - 1200.96s_ Yeah.

**Roni**: _1201.96s - 1203.96s_ Yeah, that's some of these copy issues. Flash port versions.

**Rahul**: _1212.96s - 1213.96s_ Okay, cool.

**Roni**: _1215.96s - 1216.96s_ Good?

**Rahul**: _1216.96s - 1217.96s_ Yeah, yeah.

**Roni**: _1217.96s - 1218.96s_ All is good. So, I will just update this.

**Rahul**: _1222.96s - 1223.96s_ Okay. So, I will update this.

**Roni**: _1224.96s - 1225.96s_ Okay.

**Rahul**: _1225.96s - 1226.96s_ So, I will update this.

**Roni**: _1226.96s - 1227.96s_ Okay.

**Rahul**: _1227.96s - 1228.96s_ So, I will update this.

**Roni**: _1228.96s - 1229.96s_ Okay.

**Rahul**: _1230.96s - 1231.96s_ All right.

**Roni**: _1231.96s - 1232.96s_ Then I will see you in six minutes.

**Rahul**: _1232.96s - 1233.96s_ All right.

**Roni**: _1234.96s - 1235.96s_ All right.

**Rahul**: _1235.96s - 1236.96s_ Time's up.

**Roni**: _1236.96s - 1237.96s_ See you.

**Rahul**: _1237.96s - 1238.96s_ Bye.

**Roni**: _1259.96s - 1261.96s_ Bye.

**Rahul**: _1289.96s - 1290.96s_ Bye.

**Roni**: _1290.96s - 1291.96s_ Bye.

**Rahul**: _1320.96s - 1321.96s_ Bye.

**Roni**: _1321.96s - 1322.96s_ Bye.

**Rahul**: _1322.96s - 1324.96s_ Bye.

**Roni**: _1350.96s - 1352.96s_ lar?

**Rahul**: _1352.96s - 1354.96s_ tan?

**Roni**: _1354.96s - 1356.96s_ tan?

**Rahul**: _1356.96s - 1358.96s_ tan?

**Roni**: _1358.96s - 1360.96s_ tan?

**Rahul**: _1360.96s - 1362.96s_ tan?

**Roni**: _1362.96s - 1364.96s_ tan?

**Rahul**: _1364.96s - 1366.96s_ tan?

**Roni**: _1366.96s - 1368.96s_ tan?

**Rahul**: _1368.96s - 1370.96s_ tan?

**Roni**: _1370.96s - 1372.96s_ tan?

**Rahul**: _1372.96s - 1374.96s_ tan?

**Roni**: _1374.96s - 1376.96s_ bl

**Rahul**: _1376.96s - 1378.96s_ bl

**Roni**: _1378.96s - 1382.96s_ bl

**Rahul**: _1382.96s - 1388.96s_ bl

**Roni**: _1388.96s - 1392.96s_ bl

**Rahul**: _1392.96s - 1396.96s_ bl

**Roni**: _1396.96s - 1401.96s_ bl

**Rahul**: _1401.96s - 1406.96s_ kr

**Roni**: _1406.96s - 1411.96s_ kr

**Rahul**: _1411.96s - 1416.96s_ kr

**Roni**: _1416.96s - 1421.96s_ kr

**Rahul**: _1421.96s - 1426.96s_ kr

**Roni**: _1426.96s - 1431.96s_ kr

**Rahul**: _1431.96s - 1436.96s_ kr

**Roni**: _1436.96s - 1441.96s_ kr

**Rahul**: _1441.96s - 1446.96s_ kr

**Roni**: _1446.96s - 1451.96s_ kr

**Rahul**: _1451.96s - 1456.96s_ kr

**Roni**: _1456.96s - 1461.96s_ kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr

**Rahul**: _2466.96s - 2471.96s_ kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr

**Roni**: _2716.96s - 2721.96s_ kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr

**Rahul**: _2966.96s - 2971.96s_ kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr kr

---

_Transcribed and diarized using OpenAI Whisper and GPT-4o_

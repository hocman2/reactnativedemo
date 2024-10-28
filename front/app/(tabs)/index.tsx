import { useRouter } from 'expo-router'
import {FlatList,Pressable,Image,StyleSheet, ScrollView} from 'react-native'
import {OfferProps} from "@/types/offerProps"
import { setViewedOffer } from '@/states/viewedOffer'
import { CDN_URL, DATA_SERVER_URL } from '@/consts'
import { useEffect, useState } from 'react'
import { clearSession, getUserFromStorage } from '@/states/user'
import { UserProps } from '@/types/userProps'
import { useAuth } from '@/hooks/useAuth'
import { Layout, Text, Card, Avatar, OverflowMenu, MenuItem } from '@ui-kitten/components'

const style = StyleSheet.create({	
	container: {
		padding: 24,
	},
	offerList: {
		flex: 1,
		alignContent: "center",
	},
	offerItem: {
		width: 450,
		height: 450,
		margin: "auto",
		borderRadius: 16,
		marginVertical: 4,
		shadowColor: "rgba(1, 1, 1, 0.1)",
		shadowRadius: 16,
	},
	offerPreview: {
		width: 300,
		height: 300,
	},
	cardContent: {
		marginHorizontal: "auto",
		gap: 24,
	},
});

export default function HomeScreen() {
	const router = useRouter();
	const [offers, setOffers] = useState([] as OfferProps[]);
	const [user, setUser] = useState(null as UserProps | null);
	const [menuVisible, setMenuVisible] = useState(false); 

	const authChecked = useAuth((auth) => {
		if (!auth)
			router.replace("/auth");
	});

	function offerPressed(id: string) {
		setViewedOffer(offers.find((v) => v.id === id));
		router.push(`/offers/${id}`);
	}

	function postOfferPressed() {
		router.push("/offers/create");
	}

	function openMessages() {
		router.push("/chats");
	}

	async function logout() {
		await clearSession();
		router.replace("/auth");
	} 

	useEffect(() => {
		getUserFromStorage().then((u) => setUser(u));

		fetch(DATA_SERVER_URL + "viewOffers")
			.then(async (response) => {
				const body = await response.json();
				setOffers(body);
			})
			.catch(e => console.error(e));
	}, []);

	const Item = ({offer}: {offer:OfferProps}) => (
		<Card style={style.offerItem}>
			<Pressable style={style.cardContent} onPress={() => offerPressed(offer.id)}>
				<Layout>
					<Text style={{fontWeight: 500, fontSize: 18}}>{offer.title}</Text>
					<Text style={{fontStyle: "italic", fontSize: 13}}>Postée par {offer.user.username}</Text>
				</Layout>
				<Image
			  	style={style.offerPreview}
					source={{uri: CDN_URL + offer.image}}
				/>
			</Pressable>
		</Card>
	)
	
	if (!authChecked) {
		return null;
	}

	const avatarButton = () => (
		<Pressable onPress={() => setMenuVisible(true)}>
			<Avatar source={require("../../assets/images/cat1.jpeg")}/>
		</Pressable>
	);

	return (
  	<ScrollView style={style.container}>
			{(user) ? 
				<Layout>
					<OverflowMenu visible={menuVisible} fullWidth={true} anchor={avatarButton} onBackdropPress={() => setMenuVisible(false)}>
						<MenuItem onPress={() => openMessages()} title="Messages"/>
						<MenuItem onPress={() => postOfferPressed()} title="Post offers"/>
						<MenuItem onPress={() => logout()} title="Logout"/>
					</OverflowMenu>
				</Layout>
				 : null}
			<FlatList
				style={style.offerList}
				data={offers}
				renderItem={(item) => <Item offer={item.item}/>}
			/>
	</ScrollView> 
  );
}

import BodyText from '@/app/components/atoms/BodyText';
import Title1 from '@/app/components/atoms/Title1';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { getFlagImage } from '@/app/models/Countries';
import { functions } from '@/app/utils/Functions';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

type Props = {
    pseudo: string;
    color: string;

    // Destination (Arrivée)
    countryCode: string;
    city: string;

    // Origine (Départ) - Optionnel (si null = Home)
    originCity?: string;
    originCountryCode?: string;

    onPress: () => void;
}

export default function BoardingPass({
    pseudo,
    countryCode,
    color,
    city,
    originCity,
    originCountryCode,
    onPress
}: Props) {

    // Gestion de l'affichage par défaut si premier voyage
    const displayOriginCode = originCountryCode || 'HOME';
    const displayOriginCity = originCity || 'Maison';


    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* --- EN-TÊTE DU TICKET --- */}
            <View style={[styles.header, { backgroundColor: color }]}>
                <View style={styles.airlineRow}>
                    <Image
                        source={require('../../../assets/images/logo_white_filled.png')}
                        style={{ width: 24, height: 24 }}
                    />
                    <Title2 title="UNOCCULTO AIRLINES" color={Colors.white} style={{ fontSize: 14 }} />
                </View>
                <BodyText text="BOARDING PASS" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold' }} />
            </View>

            {/* --- CORPS DU TICKET --- */}
            <View style={styles.body}>

                {/* Info Passager */}
                <View style={styles.flightInfo}>
                    <View>
                        <BodyText text="PASSAGER" style={styles.label} />
                        <BodyText text={pseudo?.toUpperCase() || 'EXPLORATEUR'} style={styles.value} isBold />
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <BodyText text="CLASSE" style={styles.label} />
                        <BodyText text="PREMIÈRE" style={styles.value} isBold />
                    </View>
                </View>

                {/* Trajet : Origine -> Destination */}
                <View style={styles.destinationContainer}>

                    {/* ORIGINE (Ancienne destination) */}
                    <View style={{ alignItems: 'center', minWidth: 60 }}>
                        <Title1 title={displayOriginCode} color={Colors.darkGrey} />
                        <BodyText text={displayOriginCity} style={{ fontSize: 10, color: Colors.darkGrey, textAlign: 'center' }} />
                    </View>

                    {/* Avion Icône */}
                    <View style={styles.planeLine}>
                        <View style={styles.line} />
                        <Image
                            source={functions.getIconSource('airplane-takeoff')}
                            style={{ width: 24, height: 24, tintColor: color, marginHorizontal: 10 }}
                        />
                        <View style={styles.line} />
                    </View>

                    {/* DESTINATION (Nouvelle) */}
                    <View style={{ alignItems: 'center', minWidth: 60 }}>
                        <Title1 title={countryCode} color={Colors.black} />
                        <BodyText text={city} style={{ fontSize: 10, color: Colors.black, textAlign: 'center' }} isBold />
                    </View>
                </View>

                {/* Footer : Drapeau & Gate */}
                <View style={styles.footerRow}>
                    <View >
                        <BodyText text="PORTE" style={styles.label} />
                        <BodyText text="A01" style={styles.value} isBold />
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <BodyText text="EMBARQUEMENT" style={styles.label} />
                        <BodyText text="IMMÉDIAT" style={{ ...styles.value, color: color }} isBold />
                    </View>
                    <View style={styles.flagContainer}>
                        <Image
                            source={getFlagImage(countryCode)}
                            style={{ width: 40, height: 25, borderRadius: 4 }}
                            resizeMode="cover"
                        />
                    </View>
                </View>
            </View>

            {/* --- LIGNE DE DÉCOUPE --- */}
            <View style={styles.cutoutRow}>
                <View style={styles.circleLeft} />
                <View style={styles.dashedLine} />
                <View style={styles.circleRight} />
            </View>

            {/* --- CODE BARRE --- */}
            <View style={styles.stub}>
                <View style={styles.barcodeLines}>
                    {[...Array(20)].map((_, i) => (
                        <View key={i} style={{
                            width: Math.random() > 0.5 ? 4 : 2,
                            height: 30,
                            backgroundColor: Colors.black,
                            opacity: 0.8
                        }} />
                    ))}
                </View>
                <BodyText text="Scanner pour décoller" style={{ fontSize: 10, color: Colors.darkGrey, marginTop: 4 }} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#FFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginVertical: 10,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    airlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    body: {
        padding: 20,
        gap: 20,
    },
    label: { fontSize: 10, color: Colors.darkGrey, marginBottom: 2 },
    value: { fontSize: 14, color: Colors.black },
    flightInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    destinationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Alignement vertical centré
        marginVertical: 5,
    },
    planeLine: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10, // Un peu d'air autour des lignes
    },
    line: {
        height: 1,
        backgroundColor: Colors.lightGrey,
        flex: 1,
        marginHorizontal: 5,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    flagContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 5,
    },
    cutoutRow: {
        height: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        position: 'relative',
        marginTop: -10,
    },
    circleLeft: {
        width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.black, marginLeft: -10,
    },
    circleRight: {
        width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.black, marginRight: -10,
    },
    dashedLine: {
        flex: 1,
        height: 1,
        borderWidth: 1,
        borderColor: Colors.lightGrey,
        borderStyle: 'dashed',
        marginHorizontal: 10,
    },
    stub: {
        backgroundColor: Colors.white,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    barcodeLines: {
        flexDirection: 'row',
        gap: 3,
        alignItems: 'center',
    }
});